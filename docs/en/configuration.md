# CCS Configuration Guide

## Automatic Configuration

The installer auto-creates config and profile templates during installation. The configuration system has been simplified for better maintainability and performance while maintaining all functionality.

**macOS / Linux**: `~/.ccs/config.json`

**Windows**: `%USERPROFILE%\.ccs\config.json`

### Recent Simplification Improvements

The configuration system has been optimized with these key improvements:
- **Streamlined validation**: Removed redundant security checks while maintaining essential validation
- **Simplified error handling**: Direct error messages instead of complex formatting
- **Improved performance**: Reduced function call overhead and complexity
- **Enhanced maintainability**: Consolidated logic with single sources of truth

## Configuration Format

### Basic Setup

```json
{
  "profiles": {
    "glm": "~/.ccs/glm.settings.json",
    "default": "~/.claude/settings.json"
  }
}
```

### Advanced Setup (Multiple Profiles)

```json
{
  "profiles": {
    "glm": "~/.ccs/glm.settings.json",
    "haiku": "~/.ccs/haiku.settings.json",
    "custom": "~/.ccs/custom.settings.json",
    "default": "~/.claude/settings.json"
  }
}
```

## Profile Configuration

### GLM Profile Example

**Location**: `~/.ccs/glm.settings.json`

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "your_glm_api_key",
    "ANTHROPIC_MODEL": "glm-4.6",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.6",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.6",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.6"
  }
}
```

### Claude (Default) Profile

- Uses `~/.claude/settings.json` (your existing Claude CLI config)
- CCS never modifies this file (non-invasive approach)

## How Configuration Works

1. CCS reads profile name from command line (defaults to "default")
2. Looks up settings file path in `~/.ccs/config.json`
3. Executes `claude --settings <file> [remaining-args]`

No magic. No file modification. Pure delegation. Works identically across all platforms.

## Environment Variables

### CCS_CONFIG

Override default config location:
```bash
export CCS_CONFIG=~/my-custom-config.json
ccs glm
```

### NO_COLOR

Disable colored terminal output:
```bash
export NO_COLOR=1
ccs glm
```

**Use Cases**:
- CI/CD pipelines
- Log files
- Terminals without color support
- Accessibility preferences

When `NO_COLOR` is set, CCS uses plain ASCII output without ANSI color codes.

## Platform-Specific Notes

### Windows Configuration

Windows uses the same file structure and approach as Linux/macOS.

**Config format** (`~/.ccs/config.json`):
```json
{
  "profiles": {
    "glm": "~/.ccs/glm.settings.json",
    "default": "~/.claude/settings.json"
  }
}
```

### macOS / Linux Configuration

Uses settings file paths with `~` expansion:

```json
{
  "profiles": {
    "glm": "~/.ccs/glm.settings.json",
    "default": "~/.claude/settings.json"
  }
}
```

Each profile points to a Claude settings JSON file. Create settings files per [Claude CLI docs](https://docs.claude.com/en/docs/claude-code/installation).

## Configuration Issues

### Profile not found

```
Error: Profile 'foo' not found in ~/.ccs/config.json
```

**Fix**: Add profile to `~/.ccs/config.json`:
```json
{
  "profiles": {
    "foo": "~/.ccs/foo.settings.json"
  }
}
```

### Settings file missing

```
Error: Settings file not found: ~/.ccs/foo.settings.json
```

**Fix**: Create settings file or fix path in config.

### Default profile missing

```
Error: Profile 'default' not found in ~/.ccs/config.json
```

**Fix**: Add "default" profile or always specify profile name:
```json
{
  "profiles": {
    "default": "~/.claude/settings.json"
  }
}
```