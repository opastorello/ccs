# CCS Workflow Documentation

Workflow documentation for CCS v2.4.4 covering installation, runtime behavior, and troubleshooting. Recently simplified with 35% code reduction while maintaining all functionality.

---

## Architecture Overview

### Simplified Architecture (Post-Optimization)

```
User Command: ccs [profile] [claude-args...]
         │
         ▼
┌─────────────────┐
│  ccs (Node.js)  │  ← Simplified entry point (139 lines, reduced from 232)
└────────┬────────┘
         │
         ├─ 1. Parse arguments & detect profile
         ├─ 2. Read ~/.ccs/config.json (simplified)
         ├─ 3. Get settings path (streamlined)
         ├─ 4. Detect Claude CLI (optimized)
         │
         ▼
┌─────────────────┐
│ Unified Spawn   │  ← Single execClaude() function (consolidated logic)
└────────┬────────┘
         │
         ▼
    ┌──────────────────┐
    │   Claude CLI     │
    └──────────────────┘
```

### Key Components (Simplified)

1. **ccs.js**: Main entry point with consolidated spawn logic
2. **config-manager.js**: Streamlined configuration handling (73 lines, reduced from 134)
3. **claude-detector.js**: Optimized Claude CLI detection (72 lines, reduced from 101)
4. **helpers.js**: Essential utilities only (48 lines, reduced from 64)

### Recent Simplification Achievements

- **35% code reduction**: 1,315 → 855 lines while maintaining all functionality
- **Consolidated spawn logic**: Single `execClaude()` function replaces 3 duplicate blocks
- **Removed security theater**: Eliminated unnecessary validation functions
- **Simplified error handling**: Direct console.error instead of complex formatting
- **Deduplicated platform checks**: Centralized cross-platform logic

### Design Principles

- **YAGNI**: Only essential features, no "just in case" code
- **KISS**: Simple delegation with unified logic
- **DRY**: Single source of truth for each concern
- **Performance**: Optimized for speed and maintainability

---

## Installation Workflow

### Process

1. **Platform Detection**: Windows vs Unix
2. **Create directories**: `~/.ccs/`, `~/.local/bin`
3. **Clean old installs**: Remove old `/usr/local/bin` installations (if CCS symlinks)
4. **Install executables**:
   - Git mode: Symlink from repo
   - Standalone: Download from GitHub
5. **Install .claude folder**: Commands and skills
6. **Create config**: `config.json` if missing
7. **Create GLM profile**: `glm.settings.json` if missing
8. **Backup**: Single `config.json.backup` (overwrites)
9. **Validate**: Check JSON syntax
10. **Configure PATH**: Auto-detect shell, add to profile
11. **Display instructions**: Shell reload, GLM API key (if needed)

### Unified Install Location (v2.2.0+)

**All Unix Systems**: `~/.local/bin/ccs`
- User-writable, no sudo required
- Auto PATH configuration for bash, zsh, fish
- Idempotent setup (safe to run multiple times)

**Windows**: `%USERPROFILE%\.ccs\ccs.ps1`
- Auto-added to user PATH

### Shell Profile Management

**Auto-detection** (`detect_shell_profile()`):
- Extracts shell from `$SHELL` variable
- Returns appropriate profile file:
  - bash: `~/.bashrc` (Linux) or `~/.bash_profile` (macOS)
  - zsh: `~/.zshrc`
  - fish: `~/.config/fish/config.fish`
- Validates shell name (alphanumeric only)
- Defaults to `~/.bashrc` if unknown

**PATH checking** (`check_path_configured()`):
- Tests if `~/.local/bin` in current `$PATH`
- Returns true if already configured

**PATH addition** (`add_to_path()`):
- Creates profile file if missing
- Checks for existing CCS marker comment
- Adds shell-specific PATH export:
  - bash/zsh: `export PATH="$HOME/.local/bin:$PATH"`
  - fish: `set -gx PATH $HOME/.local/bin $PATH`
- Idempotent: skips if already added

**Configuration workflow** (`configure_shell_path()`):
- Checks if PATH already configured
- Detects shell profile
- Adds PATH entry
- Shows reload instructions
- Fallback to manual instructions if fails

### Files Created

**Executable Locations**:
- macOS / Linux: `~/.local/bin/ccs` (symlink to `~/.ccs/ccs`)
- Windows: `%USERPROFILE%\.ccs\ccs.ps1`

**Configuration Directory** (`~/.ccs/`):
```
~/.ccs/
├── ccs                     # Main executable (symlink target)
├── config.json             # Profile mappings
├── config.json.backup      # Single backup (no timestamp)
├── glm.settings.json       # GLM profile
├── VERSION                 # Version file
├── uninstall.sh            # Uninstaller
└── .claude/                # Claude Code integration
    ├── commands/ccs.md
    └── skills/ccs-delegation/
```

---

## Runtime Workflow

### Unix/Linux/macOS

```
ccs [profile] [args]
  ↓
Read config.json
  ↓
Lookup profile → settings file path
  ↓
Validate file exists
  ↓
exec claude --settings <path> [args]
```

### Windows

```
ccs [profile] [args]
  ↓
Read config.json
  ↓
Lookup profile → settings file path
  ↓
Validate file exists
  ↓
exec claude --settings <path> [args]
```

---

## Profile System

### Config Structure

```json
{
  "profiles": {
    "glm": "~/.ccs/glm.settings.json",
    "default": "~/.claude/settings.json"
  }
}
```

### Settings File Format

**GLM Profile** (`~/.ccs/glm.settings.json`):
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

**Claude (Default)** (`~/.claude/settings.json`):
- User-managed, CCS never modifies it
- Referenced by default profile

---

## Troubleshooting

### Profile Not Found

| Check | Fix |
|-------|-----|
| config.json exists? | Run installer |
| Valid JSON? | Fix syntax or restore from backup |
| Profile in config? | Add profile or use default/glm |
| Settings file exists? | Create from template |

### PowerShell Crash (Windows)

**Error**: `SetEnvironmentVariable` error

**Fix**:
1. Check settings format has `{"env": {...}}`
2. Ensure all values are strings (not booleans/objects)
3. Remove non-env fields from settings file

### Installation Issues

| Issue | Fix |
|-------|-----|
| 404 Not Found | Check installers exist in GitHub |
| Permission denied | Check ~/.ccs/ permissions |
| jq not found | Install jq: `brew install jq` (Unix) |
| PATH warning | Add `~/.local/bin` to PATH |

---

## Terminal Output Standards

### Color Functions

**TTY Detection**: Colors only shown when output is to terminal (not piped/redirected)
```bash
if [[ -t 2 ]] && [[ -z "${NO_COLOR:-}" ]]; then
  # Enable colors
else
  # Disable colors
fi
```

**NO_COLOR Support**: Respects `NO_COLOR` environment variable
```bash
export NO_COLOR=1  # Disables all color output
```

### Message Types

**Error Messages** (red, boxed):
```
╔═════════════════════════════════════════════╗
║  ERROR                                      ║
╚═════════════════════════════════════════════╝
```

**Critical Messages** (red, boxed, "ACTION REQUIRED"):
```
╔═════════════════════════════════════════════╗
║  ACTION REQUIRED                            ║
╚═════════════════════════════════════════════╝
```

**Warning Messages** (yellow):
```
[!] WARNING
```

**Success Messages** (green):
```
[OK] Success message
```

**Info Messages** (plain):
```
[i] Information
```

### ASCII Symbols (No Emojis)

All output uses ASCII symbols for compatibility:
- `[OK]` - Success
- `[!]` - Warning
- `[X]` - Error/Failure
- `[i]` - Information

## Key Points

1. **Installation**: Unified location (`~/.local/bin`), auto PATH config, validates JSON
2. **Runtime**: Simple delegation to Claude CLI via `--settings` flag
3. **Cross-platform**: Unified Unix location, identical behavior
4. **Non-invasive**: Never touches `~/.claude/settings.json`
5. **Validation**: JSON syntax checking prevents errors
6. **Backup**: Single file, overwrites each install
7. **Terminal Output**: TTY detection, NO_COLOR support, ASCII symbols only
8. **Shell Support**: Auto-detects bash, zsh, fish
9. **Simplified Architecture**: 35% code reduction with unified spawn logic
10. **Enhanced Performance**: Optimized for speed and maintainability

---

**Version**: v2.4.4
**Updated**: 2025-11-05
**Architecture**: Simplified with consolidated components and improved maintainability
