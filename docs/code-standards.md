# CCS Code Standards

## Overview

This document defines the coding standards and principles for the CCS (Claude Code Switch) project. Following these standards ensures consistency, maintainability, and quality across the codebase.

## Core Principles

### Design Philosophy

**YAGNI** (You Aren't Gonna Need It)
- Only implement features that are immediately needed
- Avoid code "just in case" scenarios
- Keep the codebase minimal and focused

**KISS** (Keep It Simple, Stupid)
- Prefer simple solutions over complex ones
- Avoid unnecessary abstractions
- Use straightforward, readable code

**DRY** (Don't Repeat Yourself)
- Eliminate duplicate code through consolidation
- Create reusable functions for common operations
- Maintain single sources of truth

### Simplification Standards

The recent codebase simplification (35% reduction from 1,315 to 855 lines) established these standards:

1. **Consolidate duplicate logic**: Unified spawn logic in `execClaude()` function
2. **Remove security theater**: Eliminate unnecessary validation functions
3. **Simplify error handling**: Direct console.error instead of complex formatting
4. **Deduplicate platform checks**: Centralize platform-specific logic

## JavaScript Standards

### Code Style

#### File Structure
```javascript
'use strict';

// Dependencies
const { spawn } = require('child_process');
const path = require('path');
const { error } = require('./helpers');

// Constants
const CCS_VERSION = require('../package.json').version;

// Functions (grouped by responsibility)
function mainFunction() {
  // Implementation
}

// Main execution
function main() {
  // Implementation
}

// Run main
main();
```

#### Function Declarations
- Use `function` declarations for named functions
- Use arrow functions only for anonymous functions or callbacks
- Group related functions together
- Place main execution logic at the bottom

```javascript
// Good
function handleVersionCommand() {
  console.log(`CCS version ${CCS_VERSION}`);
  process.exit(0);
}

// Acceptable for callbacks
fs.readFile(file, (err, data) => {
  if (err) return error(err.message);
  // Process data
});
```

#### Variable Declarations
- Use `const` for variables that won't be reassigned
- Use `let` only when reassignment is necessary
- Declare variables as close to usage as possible
- Avoid `var` entirely

```javascript
// Good
const configPath = getConfigPath();
const claudeCli = detectClaudeCli();

// Avoid
let configPath;
configPath = getConfigPath();
```

### Error Handling Standards

#### Simple Error Reporting
```javascript
// Preferred - Simple and direct
function error(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

// Usage
if (!fs.existsSync(configPath)) {
  error(`Config file not found: ${configPath}`);
}
```

#### Avoid Complex Error Formatting
```javascript
// Avoid - Complex box-drawing formatting
function showErrorBox(message) {
  console.log('╔══════════════════════════════════════╗');
  console.log('║ ERROR                              ║');
  console.log(`║ ${message.padEnd(34)} ║`);
  console.log('╚══════════════════════════════════════╝');
}
```

#### Early Validation Pattern
```javascript
function getSettingsPath(profile) {
  // Validate early and exit fast
  const config = readConfig();
  const settingsPath = config.profiles[profile];

  if (!settingsPath) {
    error(`Profile '${profile}' not found. Available: ${Object.keys(config.profiles).join(', ')}`);
  }

  return settingsPath;
}
```

### Process Management Standards

#### Unified Spawn Logic
```javascript
// Consolidated spawn function - single source of truth
function execClaude(claudeCli, args) {
  const child = spawn(claudeCli, args, {
    stdio: 'inherit',
    windowsHide: true
  });

  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exit(code || 0);
  });

  child.on('error', () => {
    showClaudeNotFoundError();
    process.exit(1);
  });
}
```

#### Security Best Practices
- Always use arrays with `spawn()` to prevent shell injection
- Never construct shell command strings with user input
- Validate inputs before using them in file operations

```javascript
// Good - Safe with array arguments
spawn(claudeCli, ['--settings', settingsPath, ...args]);

// Avoid - Unsafe string concatenation
spawn('sh', ['-c', `claude --settings ${settingsPath} ${args.join(' ')}`]);
```

### Module Organization Standards

#### Module Dependencies
```javascript
// Group imports by type
// Node.js built-ins
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Local modules
const { error } = require('./helpers');
const { detectClaudeCli } = require('./claude-detector');
```

#### Exports Pattern
```javascript
// Clear, named exports
module.exports = {
  getConfigPath,
  readConfig,
  getSettingsPath
};

// Avoid exports with mixed responsibilities
module.exports = {
  getConfigPath,
  someUtilityFunction,
  anotherUnrelatedFunction
};
```

## Platform Compatibility Standards

### Cross-Platform Development

#### Path Handling
```javascript
// Use path module for cross-platform compatibility
const configPath = path.join(os.homedir(), '.ccs', 'config.json');

// Avoid hardcoded separators
const configPath = os.homedir() + '/.ccs/config.json'; // Unix only
```

#### Platform Detection
```javascript
// Centralized platform detection
const isWindows = process.platform === 'win32';

if (isWindows) {
  // Windows-specific logic
} else {
  // Unix/macOS logic
}
```

#### Environment Variables
```javascript
// Support both Windows and Unix environment variable formats
function expandPath(pathStr) {
  // Unix style: $HOME or ${HOME}
  pathStr = pathStr.replace(/\$\{([^}]+)\}/g, (_, name) => process.env[name] || '');

  // Windows style: %USERPROFILE%
  if (process.platform === 'win32') {
    pathStr = pathStr.replace(/%([^%]+)%/g, (_, name) => process.env[name] || '');
  }

  return path.normalize(pathStr);
}
```

## Configuration Standards

### JSON Configuration Format

#### Configuration Schema
```json
{
  "profiles": {
    "default": "~/.claude/settings.json",
    "glm": "~/.ccs/glm.settings.json"
  }
}
```

#### Settings File Format
```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "your_api_key",
    "ANTHROPIC_MODEL": "glm-4.6",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.6",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.6",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.6"
  }
}
```

### Configuration Handling Patterns

#### Safe JSON Parsing
```javascript
function readConfig() {
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configContent);
  } catch (e) {
    error(`Invalid JSON in ${configPath}: ${e.message}`);
  }
}
```

#### Validation Patterns
```javascript
function validateConfig(config) {
  if (!config.profiles || typeof config.profiles !== 'object') {
    error(`Config must have 'profiles' object`);
  }

  // Essential validation only - avoid excessive checks
  return true;
}
```

## Testing Standards

### Test Organization

#### Unit Test Structure
```javascript
const assert = require('assert');
const { getSettingsPath } = require('../../../bin/config-manager');

describe('config-manager', () => {
  describe('getSettingsPath', () => {
    it('should return settings path for valid profile', () => {
      const result = getSettingsPath('glm');
      assert(result.includes('glm.settings.json'));
    });

    it('should throw error for invalid profile', () => {
      assert.throws(() => {
        getSettingsPath('invalid');
      }, /Profile 'invalid' not found/);
    });
  });
});
```

#### Test Data Management
```javascript
// Use fixtures for test data
const testConfig = {
  profiles: {
    glm: '~/.ccs/glm.settings.json',
    default: '~/.claude/settings.json'
  }
};

// Clean up after tests
afterEach(() => {
  // Clean up test files
});
```

### Test Coverage Requirements

Before any PR, ensure:
- [ ] All new functions have unit tests
- [ ] Error conditions are tested
- [ ] Cross-platform behavior is verified
- [ ] Edge cases are covered
- [ ] Integration tests validate end-to-end workflows

## Documentation Standards

### Code Documentation

#### Function Documentation
```javascript
/**
 * Execute Claude CLI with unified spawn logic
 * @param {string} claudeCli - Path to Claude CLI executable
 * @param {string[]} args - Arguments to pass to Claude CLI
 */
function execClaude(claudeCli, args) {
  // Implementation
}
```

#### Inline Comments
```javascript
// Special case: version command (check BEFORE profile detection)
if (firstArg === '--version') {
  handleVersionCommand();
}

// Validate settings file exists before using it
if (!fs.existsSync(expandedPath)) {
  error(`Settings file not found: ${expandedPath}`);
}
```

### README Standards

#### Installation Instructions
- Provide multiple installation methods
- Include prerequisites clearly
- Show first usage examples
- Include troubleshooting links

#### Usage Examples
```bash
# Basic usage
ccs                    # Use default profile
ccs glm                # Switch to GLM profile
ccs glm "your prompt"  # One-time command with GLM

# Special commands
ccs --version          # Show version
ccs --help             # Show help
ccs --install          # Install Claude Code integration
```

## Version Management Standards

### Version Synchronization
When updating version, maintain consistency across:
1. `package.json` version field
2. `VERSION` file
3. Installer scripts (if applicable)

### Semantic Versioning
- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

## Security Standards

### Input Validation
- Validate configuration file existence and format
- Check executable permissions before use
- Sanitize user inputs appropriately

### Safe Process Execution
```javascript
// Good: Using arrays prevents shell injection
spawn(claudeCli, ['--settings', settingsPath, ...userArgs]);

// Avoid: String concatenation can lead to injection
spawn('sh', ['-c', `claude --settings ${settingsPath} ${command}`]);
```

### File System Access
- Only access known configuration directories
- Use path normalization to prevent traversal
- Validate file permissions before reading

## Performance Standards

### Optimization Principles
- Minimize function call overhead
- Reduce I/O operations through caching
- Use efficient data structures
- Avoid unnecessary computations

### Memory Management
- Use streams for large file operations
- Clean up resources properly
- Avoid memory leaks in long-running processes

## Quality Assurance Standards

### Code Review Checklist
Before submitting code, verify:
- [ ] Follows all coding standards
- [ ] Has appropriate test coverage
- [ ] Documentation is updated
- [ ] No console.log statements left in production code
- [ ] Error handling is comprehensive
- [ ] Cross-platform compatibility is maintained

### Release Checklist
Before releasing new version:
- [ ] All tests pass on all platforms
- [ ] Documentation is updated
- [ ] Version numbers are synchronized
- [ ] Installation is tested from scratch
- [ ] Edge cases are manually verified

## Contributing Standards

### Development Workflow
1. Create feature branch from main
2. Implement changes following these standards
3. Add comprehensive tests
4. Update documentation
5. Submit PR with clear description

### Pull Request Requirements
- Clear description of changes
- Test coverage for new functionality
- Documentation updates
- No breaking changes without version bump
- All CI checks passing

## Summary

These code standards ensure the CCS codebase remains:
- **Maintainable**: Clear structure and consistent patterns
- **Reliable**: Comprehensive error handling and testing
- **Performant**: Optimized for speed and memory usage
- **Secure**: Safe process execution and file handling
- **Compatible**: Works consistently across all supported platforms

Following these standards helps maintain the quality and simplicity achieved through the recent codebase simplification while enabling future development and maintenance.