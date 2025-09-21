// Jest configuration for Golden Jewelry Store testing

module.exports = {
    // Test environment
    testEnvironment: 'node',
    
    // Test file patterns
    testMatch: [
        "**/__tests__/**/*.test.js",
        "**/?(*.)+(spec|test).js"
    ],
    
    // Files to ignore
    testPathIgnorePatterns: [
        "/node_modules/",
        "/public/",  // Skip client-side JS from Jest
        "/temp/"
    ],
    
    // Coverage configuration
    collectCoverageFrom: [
        "server.js",
        "screens/**/*.js", 
        "persist_module.js",
        "!**/node_modules/**",
        "!**/public/**",    // Exclude client-side code
        "!**/coverage/**",
        "!**/*.test.js"
    ],
    
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html"],
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 60, 
            lines: 60,
            statements: 60
        }
    },
    
    // Setup and teardown
    setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
    
    // Handle async operations
    testTimeout: 10000,
    
    // Useful for debugging hanging tests
    forceExit: true,
    detectOpenHandles: true,
    
    // Verbose output for better debugging
    verbose: true,
    
    // Clear mocks between tests
    clearMocks: true,
    
    // Transform settings (if needed later for ES modules)
    transform: {}
};
