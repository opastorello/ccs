# CLAUDE.md

AI-facing guidance for Claude Code when working with this repository.

## Core Function

CLI wrapper for instant switching between multiple Claude accounts and alternative models (GLM, GLMT, Kimi). See README.md for user documentation.

## Design Principles (ENFORCE STRICTLY)

- **YAGNI**: No features "just in case"
- **KISS**: Simple bash/PowerShell/Node.js only
- **DRY**: One source of truth (config.json)
- **CLI-First**: All features must have CLI interface

## Critical Constraints (NEVER VIOLATE)

1. **NO EMOJIS** - ASCII only: [OK], [!], [X], [i]
2. **TTY-aware colors** - Respect NO_COLOR env var
3. **Non-invasive** - NEVER modify `~/.claude/settings.json`
4. **Cross-platform parity** - bash/PowerShell/Node.js must behave identically
5. **CLI documentation** - ALL changes MUST update `--help` in bin/ccs.js, lib/ccs, lib/ccs.ps1
6. **Idempotent** - All install operations safe to run multiple times

## Key Technical Details

### GLMT Implementation Notes

**[!] GLMT only in Node.js version** (`bin/ccs.js`). Native shell versions don't support GLMT (requires HTTP server).

**Critical files when working on GLMT**:
- `bin/glmt/glmt-proxy.js`: HTTP proxy server with streaming + auto-fallback
- `bin/glmt/glmt-transformer.js`: Format conversion + delta handling + tool transformation
- `bin/glmt/locale-enforcer.js`: Enforces English output
- `bin/glmt/sse-parser.js`: SSE stream parser
- `bin/glmt/delta-accumulator.js`: State tracking for streaming + tool calls
- `tests/unit/glmt/glmt-transformer.test.js`: Unit tests (35 tests passing)

**Thinking control mechanisms**:
- Keywords: `think`, `think hard`, `think harder`, `ultrathink`
- Tags: `<Thinking:On|Off>`, `<Effort:Low|Medium|High>`
- Precedence: CLI parameter > message tags > keywords

**Security limits** (DoS protection):
- SSE buffer: 1MB max
- Content buffers: 10MB max per block
- Content blocks: 100 max per message
- Request timeout: 120s

### Profile Mechanisms

**Settings-based**: `--settings` flag → GLM, GLMT, Kimi, default
**Account-based**: `CLAUDE_CONFIG_DIR` → isolated Claude Sub instances

### Shared Data Architecture

Symlinked from `~/.ccs/shared/`: commands/, skills/, agents/
Profile-specific: settings.json, sessions/, todolists/, logs/
Windows fallback: Copies if symlinks unavailable

## Code Standards (REQUIRED)

### Bash (lib/ccs)
- bash 3.2+, `set -euo pipefail`, quote all vars `"$VAR"`, `[[ ]]` tests only
- `jq` only external dependency

### PowerShell (lib/ccs.ps1)
- PowerShell 5.1+, `$ErrorActionPreference = "Stop"`
- Native JSON only, no external dependencies

### Node.js (bin/ccs.js)
- Node.js 14+, `child_process.spawn`, handle SIGINT/SIGTERM

### Terminal Output (ENFORCE)
- ASCII only: [OK], [!], [X], [i] (NO emojis)
- TTY detect before colors, respect NO_COLOR
- Box borders for errors: ╔═╗║╚╝

## Development Workflows

### Version Management
```bash
./scripts/bump-version.sh [major|minor|patch]  # Updates VERSION, install scripts
```

### Testing (REQUIRED before PR)
```bash
./tests/edge-cases.sh      # Unix
./tests/edge-cases.ps1     # Windows
```

### Local Development
```bash
./installers/install.sh && ./ccs --version     # Test install
rm -rf ~/.ccs                                  # Clean environment
```

## Development Tasks (FOLLOW STRICTLY)

### New Feature Checklist
1. Verify YAGNI/KISS/DRY alignment - reject if doesn't align
2. Implement in bash + PowerShell + Node.js (all three)
3. **REQUIRED**: Update `--help` in bin/ccs.js, lib/ccs, lib/ccs.ps1
4. Test on macOS/Linux/Windows
5. Add test cases to tests/edge-cases.*
6. Update README.md if user-facing

### Bug Fix Checklist
1. Add regression test first
2. Fix in bash + PowerShell + Node.js (all three)
3. Verify no regressions
4. Test all platforms

## Pre-PR Checklist (MANDATORY)

Platform testing:
- [ ] macOS (bash), Linux (bash), Windows (PowerShell + Git Bash)
- [ ] Edge cases pass (./tests/edge-cases.*)

Code standards:
- [ ] ASCII only (NO emojis)
- [ ] TTY colors disabled when piped
- [ ] NO_COLOR respected
- [ ] `--help` updated in bin/ccs.js, lib/ccs, lib/ccs.ps1
- [ ] `--help` consistent across all three

Install/behavior:
- [ ] Idempotent install
- [ ] Concurrent sessions work
- [ ] Instance isolation maintained

## Implementation Details

### Profile Resolution Logic
1. Check `profiles.json` (account-based) → `CLAUDE_CONFIG_DIR`
2. Check `config.json` (settings-based) → `--settings`
3. Not found → error + list available profiles

### Settings Format (CRITICAL)
All env values MUST be strings (not booleans/objects) to prevent PowerShell crashes.

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "key",
    "ANTHROPIC_MODEL": "glm-4.6",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.6",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.6",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.6"
  }
}
```

## GLMT Debugging (Common Issues)

### Debug Mode
```bash
export CCS_DEBUG=1
ccs glmt --verbose "test"  # File logs: ~/.ccs/logs/
```

### Known Issues & Fixes

**No Thinking Blocks**:
- Check Z.AI API plan supports reasoning_content
- Test with keywords: `ccs glmt "think about the solution"`

**Empty Thinking Blocks** (v3.5.1+):
- Fixed: Signature timing race (see tests/unit/glmt/test-thinking-signature-race.js)

**Tool Execution Issues**:
- MCP tools outputting XML: Fixed in v3.5
- Debug with `CCS_DEBUG=1` to inspect transformation

**Streaming Issues**:
- Buffer errors: Hit DoS limits (1MB SSE, 10MB content)
- Auto-fallback to buffered mode on error

## Error Handling Principles

- Validate early, fail fast with clear messages
- Show available options on mistakes
- Never leave broken state
