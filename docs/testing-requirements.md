# CCS Testing Requirements & Procedures

**Version:** 2.4.4
**Last Updated:** 2025-11-05
**Status:** Active

## Overview

This document outlines the comprehensive testing requirements and procedures for the CCS (Claude Code Switch) project. Following these guidelines ensures consistent, reliable, and cross-platform compatible releases across both npm package and shell installer methods.

## Test Suite Structure

### Core Test Files

| Test Type | Files | Purpose | Coverage | Platforms |
|-----------|-------|---------|----------|-----------|
| **npm Package Tests** | `tests/npm/*.test.js` | npm package functionality | 4 files | Cross-platform |
| **Unit Tests** | `tests/shared/unit/*.test.js` | Core utilities testing | 1 file | Cross-platform |
| **Native Shell Tests** | `tests/native/unix/*.sh` | Shell installer testing | 3 files | Unix/Linux/macOS |
| **Edge Case Tests** | `tests/edge-cases.sh` | Comprehensive edge cases | 1 file | Unix/Linux/macOS |
| **Comprehensive Testing** | `plans/251105-*/` | 5-phase testing framework | 5 phases | Cross-platform |

### Test Categories

#### 1. npm Package Tests (39 tests)
**Files:** `tests/npm/*.test.js`, `tests/shared/unit/*.test.js`

**Coverage Areas:**
- **Installation Testing** (npm global install, postinstall script)
- **Configuration Management** (auto-creation, JSON validation)
- **CLI Functionality** (version, help, profile switching)
- **Error Handling** (invalid profiles, missing configs)
- **Performance Testing** (startup times, memory usage)
- **Cross-Platform Testing** (bash, zsh, different PATH configurations)

#### 2. Shell Installer Tests (57 tests)
**Files:** `tests/native/unix/*.sh`, `tests/edge-cases.sh`

**Coverage Areas:**
- **Installation Process** (curl installer, directory creation)
- **Uninstall Functionality** (complete cleanup, PATH restoration)
- **Shell Script Logic** (jq integration, platform detection)
- **Edge Cases** (partial installs, error scenarios)
- **Configuration Management** (profile handling, file validation)
- **Integration Testing** (Claude CLI connectivity)

#### 3. Comprehensive Cross-Compatibility Testing
**Framework:** 5-Phase Testing (`plans/251105-comprehensive-ccs-testing/`)

**Phases:**
1. **Environment Assessment & Cleanup** (System state validation)
2. **npm Package Testing** (Full npm package validation)
3. **Shell Installer Testing** (Shell method validation)
4. **Cross-Compatibility Testing** (Migration between methods)
5. **Final Cleanup & Validation** (System restoration)

**Key Findings from Latest Testing:**
- npm version: 21ms startup, Node.js based, cross-platform
- Shell version: 5ms startup (4x faster), bash based, Unix-like only
- Configuration: Fully compatible between methods
- Migration: Seamless switching between installation methods

## Testing Environment Requirements

### Environment Variable Isolation

**Critical Requirement:** All tests must use isolated HOME directories to prevent impact on user data.

**Implementation Pattern:**
```bash
# Unix/Linux/macOS
HOME=/tmp/test-ccs-home ./ccs --install
HOME=/tmp/test-ccs-home ./ccs --uninstall

# Windows PowerShell
$env:HOME = "C:\temp\test-ccs-home"
.\ccs.ps1 --install
.\ccs.ps1 --uninstall
```

**Validation Requirements:**
- ✅ Install uses test directory (not `~/.claude`)
- ✅ Uninstall removes files from test directory only
- ✅ Real user directories completely unaffected
- ✅ Perfect test isolation achieved

### Cross-Platform Compatibility

**Platform-Specific Patterns:**
- **Bash Version:** Uses `$HOME/.claude` directly
- **PowerShell Version:** Uses HOME-first pattern with USERPROFILE fallback

**PowerShell Pattern:**
```powershell
$HomeDir = if ($env:HOME) { $env:HOME } else { $env:USERPROFILE }
```

## Test Execution Procedures

### Prerequisites

1. **Clean Test Environment**
   ```bash
   # Remove any existing CCS installation
   rm -rf ~/.ccs ~/.local/bin/ccs
   ```

2. **Required Tools**
   - bash 3.2+ (Unix/Linux/macOS)
   - PowerShell 5.1+ (Windows)
   - Claude CLI 2.0.31+
   - jq 1.6+ (optional, for JSON validation)

### Running Tests

#### Unix/Linux/macOS
```bash
# Navigate to CCS directory
cd /path/to/ccs

# Run uninstall tests
./tests/uninstall-test.sh

# Run edge case tests
./tests/edge-cases.sh

# Run all tests (full suite)
./tests/uninstall-test.sh && ./tests/edge-cases.sh
```

#### Windows
```powershell
# Navigate to CCS directory
cd C:\path\to\ccs

# Run uninstall tests
.\tests\uninstall-test.ps1

# Run edge case tests
.\tests\edge-cases.ps1

# Run all tests (full suite)
.\tests\uninstall-test.ps1; .\tests\edge-cases.ps1
```

### Expected Results

**Success Criteria:**
- **Total Test Pass Rate:** 100%
- **Individual Test Suites:** Each must pass 100%
- **Environment Isolation:** No impact on user data
- **Cross-Platform Consistency:** Identical behavior across platforms

**Sample Output:**
```
=== CCS Uninstall Test Results ===
Total Tests: 20
Passed: 20 (100%)
Failed: 0 (0%)
Status: ✅ ALL TESTS PASSED
```

## Quality Assurance Standards

### Code Quality Requirements

1. **Syntax Validation**
   ```bash
   # Bash syntax check
   bash -n ccs
   bash -n install.sh
   bash -n uninstall.sh

   # PowerShell syntax check
   Get-Command Test-Path -Syntax ccs.ps1
   ```

2. **Pattern Consistency**
   - HOME-first environment variable pattern
   - Consistent error handling
   - Uniform output formatting

3. **Security Validation**
   - No impact on user data
   - Proper file permissions
   - No unauthorized directory access

### Functional Testing Requirements

1. **Happy Path Testing**
   - Standard operations work perfectly
   - Default behaviors function as expected
   - User workflows complete successfully

2. **Edge Case Handling**
   - Robust handling of unexpected inputs
   - Graceful failure modes
   - Clear error messages with actionable solutions

3. **Integration Testing**
   - CLI integration with all commands
   - Path operations work correctly
   - Environment variable handling is reliable

## Test Coverage Metrics

### Current Coverage (v2.4.5)

| Test Category | Tests | Pass Rate | Status |
|---------------|-------|-----------|--------|
| npm Package Tests | 39 | 100% | ✅ Complete |
| Unit Tests | 3 | 100% | ✅ Complete |
| Shell Installer Tests | 57 | 100% | ✅ Complete |
| Cross-Compatibility Tests | 15 | 100% | ✅ Complete |
| Environment Isolation | 114 | 100% | ✅ Complete |
| **Total Coverage** | **114** | **100%** | **✅ Complete** |

### Coverage Goals for Future Releases

| Metric | Target | Current Status |
|--------|--------|----------------|
| Test Pass Rate | >95% | 100% ✅ |
| Cross-Platform Coverage | 100% | 100% ✅ |
| Edge Case Coverage | >90% | 100% ✅ |
| Environment Isolation | 100% | 100% ✅ |
| Security Validation | 100% | 100% ✅ |
| npm Package Testing | 100% | 100% ✅ |
| Installation Method Compatibility | 100% | 100% ✅ |

## Automated Testing Integration

### CI/CD Pipeline Requirements

**Recommended Integration:**
```yaml
# GitHub Actions example
- name: Run CCS Tests
  run: |
    npm test
    # This runs: npm run test:unit && npm run test:npm
```

**Enhanced Pipeline:**
```yaml
# Comprehensive testing
- name: Environment Assessment
  run: ./scripts/clean-test-environment.sh

- name: npm Package Testing
  run: npm test

- name: Shell Installer Testing
  run: ./tests/native/unix/installer-tests.sh

- name: Cross-Compatibility Testing
  run: ./scripts/test-installation-methods.sh
```

**Test Automation Benefits:**
- Consistent test execution across all installation methods
- Early detection of regressions
- Cross-platform validation
- Automated quality gates
- Installation method compatibility verification

### Performance Testing

**Test Execution Benchmarks (Latest Results):**
- **npm Package Tests:** ~45 seconds
- **Shell Installer Tests:** ~60 seconds
- **Cross-Compatibility Tests:** ~90 seconds
- **Total Suite:** ~3-4 minutes (comprehensive 5-phase testing)
- **Memory Usage:** Minimal
- **Disk I/O:** Controlled and temporary

**Performance Comparison:**
- **npm version startup:** 21ms
- **Shell version startup:** 5ms (4x faster)
- **Installation time:** npm (1.5s) vs Shell (3s)

## Test Maintenance Procedures

### When to Update Tests

1. **New Features Added**
   - Add corresponding test cases
   - Update test documentation
   - Validate cross-platform compatibility

2. **Bug Fixes Implemented**
   - Add regression tests for fixed bugs
   - Verify fix doesn't break existing functionality
   - Update test coverage metrics

3. **Platform Changes**
   - Test on new platform versions
   - Update platform-specific test cases
   - Validate compatibility

### Test Review Process

1. **Code Review Integration**
   - Tests reviewed alongside code changes
   - Ensure test coverage for new functionality
   - Validate test quality and effectiveness

2. **Release Validation**
   - Full test suite execution before releases
   - Cross-platform validation
   - Performance benchmarking

## Troubleshooting Test Failures

### Common Issues

1. **Environment Variable Conflicts**
   - **Symptom:** Tests affecting user directories
   - **Solution:** Verify HOME isolation pattern
   - **Prevention:** Always use isolated test environments

2. **Permission Issues**
   - **Symptom:** File operation failures
   - **Solution:** Check file permissions and paths
   - **Prevention:** Validate prerequisites before testing

3. **Platform-Specific Failures**
   - **Symptom:** Tests pass on one platform, fail on another
   - **Solution:** Review platform-specific code paths
   - **Prevention:** Test on all supported platforms

### Debug Procedures

1. **Enable Verbose Output**
   ```bash
   # Add debug flags to test scripts
   ./tests/uninstall-test.sh --verbose
   ```

2. **Isolate Failing Tests**
   ```bash
   # Run individual test sections
   ./tests/uninstall-test.sh --section=empty-uninstall
   ```

3. **Validate Environment**
   ```bash
   # Check environment variables
   echo "HOME: $HOME"
   echo "USERPROFILE: $USERPROFILE"
   ```

## Best Practices

### Test Development Guidelines

1. **Test Isolation**
   - Never modify user data during tests
   - Use temporary directories for all file operations
   - Clean up all test artifacts

2. **Cross-Platform Considerations**
   - Test on all supported platforms
   - Use platform-agnostic patterns where possible
   - Handle platform-specific differences explicitly

3. **Maintainability**
   - Clear test documentation
   - Consistent test structure
   - Reusable test utilities

### Continuous Improvement

1. **Test Coverage Analysis**
   - Regular coverage assessment
   - Identify untested code paths
   - Prioritize high-risk areas

2. **Performance Monitoring**
   - Track test execution times
   - Identify performance regressions
   - Optimize slow test cases

3. **Quality Metrics**
   - Monitor test pass rates
   - Track bug detection rates
   - Measure test effectiveness

## References

### Related Documentation
- **Project Roadmap:** `/docs/project-roadmap.md`
- **Implementation Plans:** `/plans/`
- **Code Standards:** `/docs/code-standards.md`
- **System Architecture:** `/docs/system-architecture.md`

### Test Reports
- **Uninstall Test Report:** `/plans/reports/241103-from-qa-engineer-to-development-team-ccs-uninstall-testing-report.md`
- **Code Review Reports:** `/plans/reports/251103-code-review-phase1-phase2.md`

### External Resources
- **Claude CLI Documentation:** https://docs.anthropic.com/claude/reference/claude-cli
- **PowerShell Best Practices:** https://docs.microsoft.com/en-us/powershell/scripting/dev-cross-plat/writing-portable-cmdlets

---

**Maintained By:** Development Team
**Review Frequency:** After major releases or significant code changes
**Last Updated:** 2025-11-05

**Recent Changes:**
- Added npm package testing framework (39 tests)
- Comprehensive cross-compatibility testing (5-phase framework)
- Updated performance benchmarks and comparisons
- Enhanced CI/CD pipeline recommendations

**Unresolved Questions:** None
**Blockers:** None
**Next Review:** Post v2.4.5 release or after next major code simplification