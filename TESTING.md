# Testing Guide

This project uses Jest as the testing framework for both unit and integration tests.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

## Test Structure

```
tests/
├── setup.js                 # Jest configuration and global mocks
├── unit/                    # Unit tests for individual components
│   ├── script.test.js      # Frontend JavaScript tests
│   └── deploy.test.js      # Deployment script tests
└── integration/            # Integration tests
    └── html-validation.test.js  # HTML structure validation
```

## Writing Tests

### Unit Tests

Unit tests should test individual functions and components in isolation.

Example:
```javascript
describe('Component Name', () => {
  beforeEach(() => {
    // Setup
  });

  test('should do something', () => {
    // Test implementation
  });
});
```

### Integration Tests

Integration tests verify that multiple components work together correctly.

Example:
```javascript
describe('Feature Integration', () => {
  test('should integrate components correctly', () => {
    // Test multiple components together
  });
});
```

## Test Coverage

The project aims for:
- **Minimum 50% coverage** for branches, functions, lines, and statements
- Coverage reports are generated in the `coverage/` directory
- Coverage thresholds are configured in `jest.config.js`

## Best Practices

1. **Write tests first** (TDD) when possible
2. **Test behavior, not implementation**
3. **Keep tests isolated** - each test should be independent
4. **Use descriptive test names** - they should explain what is being tested
5. **Mock external dependencies** - don't rely on external services in tests
6. **Keep tests fast** - unit tests should run quickly

## Continuous Integration

Tests run automatically on:
- Every push to `main` or `develop` branches
- Every pull request
- Multiple Node.js versions (18.x, 20.x)

See `.github/workflows/test.yml` for CI configuration.

## Debugging Tests

```bash
# Run tests with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run a specific test file
npm test -- script.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="mobile toggle"
```

## Common Issues

### Tests timing out
- Check for async operations that aren't being awaited
- Ensure `done()` callback is called in async tests

### DOM not available
- Ensure `testEnvironment: 'jsdom'` is set in `jest.config.js`
- Check that `setupFilesAfterEnv` includes the setup file

### Module not found
- Verify file paths are correct
- Check `moduleNameMapper` in `jest.config.js` for path aliases

