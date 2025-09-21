// Test setup file for Golden Jewelry Store
// This file runs before all tests

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = 0; // Use random port for tests

// Global test utilities and timeouts
global.testTimeout = 10000;

// Console formatting for tests
const originalConsoleError = console.error;
console.error = (...args) => {
    // Suppress specific known test warnings
    if (typeof args[0] === 'string' && args[0].includes('Warning: connect.session()')) {
        return;
    }
    originalConsoleError.apply(console, args);
};

// Clean up after all tests
afterAll(async () => {
    // Give time for any async operations to complete
    await new Promise(resolve => setTimeout(resolve, 500));
});

// Mock localStorage for tests that might use it
if (typeof localStorage === 'undefined') {
    global.localStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
    };
}

// Helper function to create test users
global.createTestUser = (username = 'testuser') => ({
    username,
    password: 'testpass123',
    email: `${username}@test.com`,
    role: 'user',
    createdAt: new Date().toISOString()
});

// Helper function to create test products
global.createTestProduct = (id = 1, name = 'Test Product') => ({
    id,
    name,
    description: `Description for ${name}`,
    price: 99.99,
    category: 'test',
    image: 'test-image.jpg',
    inStock: true
});

console.log('🧪 Test environment initialized');
