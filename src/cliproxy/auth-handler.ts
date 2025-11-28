/**
 * Auth Handler for CLIProxyAPI
 *
 * Manages OAuth authentication for CLIProxy providers (Gemini, ChatGPT, Qwen).
 * CLIProxyAPI handles OAuth internally - we just need to:
 * 1. Check if auth exists (token files in auth-dir)
 * 2. Trigger OAuth flow by spawning binary with auth flag
 * 3. Provide headless fallback (display URL for manual auth)
 *
 * Token storage: ~/.ccs/cliproxy-auth/<provider>/
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { ProgressIndicator } from '../utils/progress-indicator';
import { getAuthDir } from './config-generator';
import { ensureCLIProxyBinary } from './binary-manager';
import { CLIProxyProvider } from './types';

/**
 * Auth status for a provider
 */
export interface AuthStatus {
  /** Provider name */
  provider: CLIProxyProvider;
  /** Whether authentication exists */
  authenticated: boolean;
  /** Path to token directory */
  tokenDir: string;
  /** Token file paths found */
  tokenFiles: string[];
  /** When last authenticated (if known) */
  lastAuth?: Date;
}

/**
 * OAuth config for each provider
 */
interface ProviderOAuthConfig {
  /** Provider identifier */
  provider: CLIProxyProvider;
  /** Display name */
  displayName: string;
  /** OAuth authorization URL (for manual flow) */
  authUrl: string;
  /** Scopes required */
  scopes: string[];
  /** CLI flag for auth */
  authFlag: string;
}

/**
 * OAuth configurations per provider
 * Note: CLIProxyAPI handles actual OAuth - these are for display/manual flow
 */
const OAUTH_CONFIGS: Record<CLIProxyProvider, ProviderOAuthConfig> = {
  gemini: {
    provider: 'gemini',
    displayName: 'Google Gemini',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/generative-language'],
    authFlag: '--auth-gemini',
  },
  chatgpt: {
    provider: 'chatgpt',
    displayName: 'ChatGPT/OpenAI',
    authUrl: 'https://auth.openai.com/authorize',
    scopes: ['openid', 'profile'],
    authFlag: '--auth-codex',
  },
  qwen: {
    provider: 'qwen',
    displayName: 'Alibaba Qwen',
    authUrl: 'https://auth.aliyun.com/oauth2/authorize',
    scopes: ['dashscope'],
    authFlag: '--auth-qwen',
  },
};

/**
 * Get OAuth config for provider
 */
export function getOAuthConfig(provider: CLIProxyProvider): ProviderOAuthConfig {
  const config = OAUTH_CONFIGS[provider];
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  return config;
}

/**
 * Get token directory for provider
 */
export function getProviderTokenDir(provider: CLIProxyProvider): string {
  return path.join(getAuthDir(), provider);
}

/**
 * Check if provider has valid authentication
 */
export function isAuthenticated(provider: CLIProxyProvider): boolean {
  const tokenDir = getProviderTokenDir(provider);

  if (!fs.existsSync(tokenDir)) {
    return false;
  }

  // Check for any token files (CLIProxyAPI stores tokens with various names)
  const files = fs.readdirSync(tokenDir);
  const tokenFiles = files.filter(
    (f) => f.endsWith('.json') || f.endsWith('.token') || f === 'credentials'
  );

  return tokenFiles.length > 0;
}

/**
 * Get detailed auth status for provider
 */
export function getAuthStatus(provider: CLIProxyProvider): AuthStatus {
  const tokenDir = getProviderTokenDir(provider);
  let tokenFiles: string[] = [];
  let lastAuth: Date | undefined;

  if (fs.existsSync(tokenDir)) {
    const files = fs.readdirSync(tokenDir);
    tokenFiles = files.filter(
      (f) => f.endsWith('.json') || f.endsWith('.token') || f === 'credentials'
    );

    // Get most recent modification time
    for (const file of tokenFiles) {
      const filePath = path.join(tokenDir, file);
      const stats = fs.statSync(filePath);
      if (!lastAuth || stats.mtime > lastAuth) {
        lastAuth = stats.mtime;
      }
    }
  }

  return {
    provider,
    authenticated: tokenFiles.length > 0,
    tokenDir,
    tokenFiles,
    lastAuth,
  };
}

/**
 * Get auth status for all providers
 */
export function getAllAuthStatus(): AuthStatus[] {
  const providers: CLIProxyProvider[] = ['gemini', 'chatgpt', 'qwen'];
  return providers.map(getAuthStatus);
}

/**
 * Clear authentication for provider
 */
export function clearAuth(provider: CLIProxyProvider): boolean {
  const tokenDir = getProviderTokenDir(provider);

  if (!fs.existsSync(tokenDir)) {
    return false;
  }

  // Remove all files in token directory
  const files = fs.readdirSync(tokenDir);
  for (const file of files) {
    fs.unlinkSync(path.join(tokenDir, file));
  }

  // Remove directory
  fs.rmdirSync(tokenDir);

  return true;
}

/**
 * Trigger OAuth flow for provider
 * Opens browser for user authentication
 */
export async function triggerOAuth(
  provider: CLIProxyProvider,
  options: { verbose?: boolean; headless?: boolean } = {}
): Promise<boolean> {
  const oauthConfig = getOAuthConfig(provider);
  const { verbose = false, headless = false } = options;

  const log = (msg: string) => {
    if (verbose) {
      console.error(`[auth] ${msg}`);
    }
  };

  // Ensure binary exists
  let binaryPath: string;
  try {
    binaryPath = await ensureCLIProxyBinary(verbose);
  } catch (error) {
    console.error('[X] Failed to prepare CLIProxy binary');
    throw error;
  }

  // Ensure auth directory exists
  const tokenDir = getProviderTokenDir(provider);
  fs.mkdirSync(tokenDir, { recursive: true, mode: 0o700 });

  // Headless mode: display manual instructions
  if (headless) {
    console.log('');
    console.log(`[i] Headless mode: Manual authentication required for ${oauthConfig.displayName}`);
    console.log('');
    console.log('Instructions:');
    console.log(`  1. Run CLIProxyAPI binary with auth flag on a machine with browser:`);
    console.log(`     ${binaryPath} ${oauthConfig.authFlag}`);
    console.log('');
    console.log(`  2. Complete OAuth in browser`);
    console.log('');
    console.log(`  3. Copy token files from CLIProxyAPI auth directory to:`);
    console.log(`     ${tokenDir}`);
    console.log('');
    return false;
  }

  // Standard mode: spawn binary with auth flag
  const spinner = new ProgressIndicator(`Authenticating with ${oauthConfig.displayName}`);
  spinner.start();

  console.log('');
  console.log(`[i] Opening browser for ${oauthConfig.displayName} authentication...`);
  console.log('[i] Complete the login in your browser.');
  console.log('');

  return new Promise<boolean>((resolve) => {
    // Spawn CLIProxyAPI with auth flag
    // Note: CLIProxyAPI handles the OAuth flow internally
    const authProcess = spawn(binaryPath, [oauthConfig.authFlag], {
      stdio: verbose ? 'inherit' : ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        // Set auth directory for CLIProxyAPI
        CLI_PROXY_AUTH_DIR: tokenDir,
      },
    });

    let stderrData = '';

    if (!verbose) {
      authProcess.stdout?.on('data', (data: Buffer) => {
        log(`stdout: ${data.toString().trim()}`);
      });

      authProcess.stderr?.on('data', (data: Buffer) => {
        stderrData += data.toString();
        log(`stderr: ${data.toString().trim()}`);
      });
    }

    // Timeout after 2 minutes
    const timeout = setTimeout(() => {
      spinner.fail('Authentication timeout');
      authProcess.kill();
      console.error('[X] OAuth timed out after 2 minutes');
      console.error('');
      console.error('Troubleshooting:');
      console.error('  - Make sure a browser is available');
      console.error('  - Try running with --verbose for details');
      console.error(`  - For headless systems, use: ccs ${provider} --auth --headless`);
      resolve(false);
    }, 120000);

    authProcess.on('exit', (code) => {
      clearTimeout(timeout);

      if (code === 0) {
        spinner.succeed(`Authenticated with ${oauthConfig.displayName}`);

        // Verify token was created
        if (isAuthenticated(provider)) {
          console.log('[OK] Authentication successful');
          resolve(true);
        } else {
          spinner.fail('Authentication incomplete');
          console.error('[X] Token not found after authentication');
          console.error('    The OAuth flow may have been cancelled');
          resolve(false);
        }
      } else {
        spinner.fail('Authentication failed');
        console.error(`[X] CLIProxyAPI auth exited with code ${code}`);
        if (stderrData) {
          console.error(`    ${stderrData.trim()}`);
        }
        resolve(false);
      }
    });

    authProcess.on('error', (error) => {
      clearTimeout(timeout);
      spinner.fail('Authentication error');
      console.error(`[X] Failed to start auth process: ${error.message}`);
      resolve(false);
    });
  });
}

/**
 * Ensure provider is authenticated
 * Triggers OAuth flow if not authenticated
 */
export async function ensureAuth(
  provider: CLIProxyProvider,
  options: { verbose?: boolean; headless?: boolean } = {}
): Promise<boolean> {
  // Check if already authenticated
  if (isAuthenticated(provider)) {
    if (options.verbose) {
      console.error(`[auth] ${provider} already authenticated`);
    }
    return true;
  }

  // Not authenticated - trigger OAuth
  const oauthConfig = getOAuthConfig(provider);
  console.log(`[i] ${oauthConfig.displayName} authentication required`);

  return triggerOAuth(provider, options);
}

/**
 * Display auth status for all providers
 */
export function displayAuthStatus(): void {
  console.log('CLIProxy Authentication Status:');
  console.log('');

  const statuses = getAllAuthStatus();

  for (const status of statuses) {
    const oauthConfig = getOAuthConfig(status.provider);
    const icon = status.authenticated ? '[OK]' : '[!]';
    const authStatus = status.authenticated ? 'Authenticated' : 'Not authenticated';
    const lastAuthStr = status.lastAuth ? ` (last: ${status.lastAuth.toLocaleDateString()})` : '';

    console.log(`${icon} ${oauthConfig.displayName}: ${authStatus}${lastAuthStr}`);
  }

  console.log('');
  console.log('To authenticate: ccs <provider> --auth');
  console.log('To logout:       ccs <provider> --logout');
}
