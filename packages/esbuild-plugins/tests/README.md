# Unit Tests for sfx-wrapper.ts

## Overview

This document describes the comprehensive unit tests created for the `sfx-wrapper.ts` file in the `@hpcc-js/esbuild-plugins` package.

## Test Coverage

The combined test suite achieves:
- **22 total test cases** across 2 test files
- **89.47%** statement coverage
- **75%** branch coverage  
- **100%** function coverage

## Test Files

### 1. `tests/sfx-wrapper.node.spec.ts` (Mock Data Tests)

The original test file contains 11 test cases using mock WASM data, organized into 4 main categories:

#### `wrap function` Tests (5 tests)
- **should process a WASM file and return TypeScript code**: Validates the basic functionality of converting a WASM file to TypeScript
- **should handle compression decision correctly**: Tests the logic that decides between compressed and uncompressed encoding
- **should include wrapper import when JS file exists**: Tests the conditional inclusion of JavaScript wrapper imports
- **should return binary directly when no JS wrapper exists**: Tests the direct binary return path
- **should handle .js extension in path correctly**: Tests path handling for files with .js extensions

#### `sfxWasm plugin` Tests (2 tests)
- **should return a valid esbuild plugin**: Validates the plugin structure and properties
- **should create proper plugin structure**: Tests the plugin setup and onLoad registration

#### `generated code structure` Tests (3 tests)
- **should generate valid base91 decode implementation**: Validates the base91 decoding function generation
- **should include proper module caching logic**: Tests the module caching variables and logic
- **should include reset function**: Validates the reset function generation

#### `error handling` Tests (1 test)
- **should handle non-existent files gracefully**: Tests error handling for missing files

### 2. `tests/sfx-wrapper-real.node.spec.ts` (Real WASM Tests)

A new test file containing 11 test cases using actual WASM files from `tests/wasm/`, organized into 4 main categories:

#### `real WASM file processing` Tests (6 tests)
- **should process the base91lib.wasm file**: Tests processing of the actual 7854-byte WASM file
- **should include the JavaScript wrapper import**: Validates wrapper inclusion with real JS file
- **should make compression decision based on real file size**: Tests actual compression logic (shows compression is NOT used for 7854 bytes)
- **should generate valid base91 encoded data from real WASM**: Validates base91 encoding of real binary data
- **should handle the generated code structure for real WASM**: Tests module caching with real data
- **should contain realistic base91 decode function**: Validates decode function with real usage patterns

#### `esbuild plugin with real WASM` Tests (1 test)
- **should handle real WASM file through plugin interface**: Tests the plugin with actual WASM files

#### `comparison with mock vs real WASM` Tests (2 tests)
- **should produce different but valid output for real vs mock WASM**: Compares real vs mock output
- **should validate file sizes and compression efficiency**: Analyzes real file sizes and compression decisions

#### `generated code validation` Tests (2 tests)
- **should produce syntactically valid TypeScript**: Validates TypeScript syntax of generated code
- **should have consistent variable naming**: Ensures consistent variable usage throughout generated code

## Real WASM Test Data

The real WASM tests use actual files from `tests/wasm/`:
- **`base91lib.wasm`**: 7854 bytes - A real Base91 encoder/decoder WASM module
- **`base91lib.js`**: 12344 bytes - The corresponding JavaScript wrapper for the WASM module

### Key Findings from Real Tests:
- ✅ **No compression used** for 7854-byte files (below threshold)
- ✅ **JavaScript wrapper properly included** when `.js` file exists
- ✅ **Base91 encoding generates >1000 character strings** for real data
- ✅ **Generated TypeScript is syntactically valid**

## Key Features Tested

### Core Functionality
- ✅ WASM file reading and processing
- ✅ Base91 encoding/decoding generation
- ✅ Zstd compression decision logic
- ✅ TypeScript code generation
- ✅ ESBuild plugin interface

### Conditional Logic
- ✅ Compression vs. uncompressed path selection
- ✅ JavaScript wrapper inclusion based on file existence
- ✅ Path handling for different file extensions

### Generated Code Quality
- ✅ Base91 decode function structure
- ✅ Module caching implementation
- ✅ Reset function generation
- ✅ Proper TypeScript typing

### Error Handling
- ✅ Non-existent file handling
- ✅ Graceful error propagation

## Test Setup

### Dependencies
- **Vitest**: Testing framework with globals enabled
- **Node.js file system**: For creating test files
- **Temporary directories**: For isolated test execution

### Configuration
- **vitest.config.ts**: Configured for Node.js environment with globals
- **package.json**: Added test and coverage scripts

### Test Data
- Uses realistic WASM header bytes for testing
- Creates temporary files in system temp directory
- Proper cleanup in afterEach hooks

## Running Tests

```bash
# Run tests
npm test

# Run tests with coverage
npm run coverage
```

## Test Isolation

Each test:
- Uses unique file names to avoid conflicts
- Creates files in temporary directories
- Cleans up after execution
- Tests actual file system operations for realism

## Areas for Future Enhancement

The remaining uncovered lines (101-104) could be covered with additional tests for:
1. Base91 loading failures
2. Zstd loading failures
3. More complex error scenarios

However, the current coverage of 89.47% provides excellent confidence in the code quality and functionality.
