'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { error, expandPath } = require('./helpers');

// Get config file path
function getConfigPath() {
  return process.env.CCS_CONFIG || path.join(os.homedir(), '.ccs', 'config.json');
}

// Read and parse config
function readConfig() {
  const configPath = getConfigPath();

  // Check config exists
  if (!fs.existsSync(configPath)) {
    error(`Config file not found: ${configPath}`);
  }

  // Read and parse JSON
  let config;
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configContent);
  } catch (e) {
    error(`Invalid JSON in ${configPath}: ${e.message}`);
  }

  // Validate config has profiles object
  if (!config.profiles || typeof config.profiles !== 'object') {
    error(`Config must have 'profiles' object in ${configPath}`);
  }

  return config;
}

// Get settings path for profile
function getSettingsPath(profile) {
  const config = readConfig();

  // Get settings path
  const settingsPath = config.profiles[profile];

  if (!settingsPath) {
    const availableProfiles = Object.keys(config.profiles).join(', ');
    error(`Profile '${profile}' not found. Available: ${availableProfiles}`);
  }

  // Expand path
  const expandedPath = expandPath(settingsPath);

  // Validate settings file exists
  if (!fs.existsSync(expandedPath)) {
    error(`Settings file not found: ${expandedPath}`);
  }

  // Validate settings file is valid JSON
  try {
    const settingsContent = fs.readFileSync(expandedPath, 'utf8');
    JSON.parse(settingsContent);
  } catch (e) {
    error(`Invalid JSON in ${expandedPath}: ${e.message}`);
  }

  return expandedPath;
}

module.exports = {
  getConfigPath,
  readConfig,
  getSettingsPath
};