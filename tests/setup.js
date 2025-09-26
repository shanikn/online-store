const { testDataManager } = require('./fixtures/test-data');

// Global test setup
beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';

    // Initialize test data manager
    await testDataManager.initialize();

    // Set longer timeout for integration tests
    jest.setTimeout(30000);
});

// Global test teardown
afterAll(async () => {
    // Cleanup test data
    await testDataManager.cleanup();
});

// Add custom matchers
expect.extend({
    toHaveValidStructure(received, expectedKeys) {
        const pass = expectedKeys.every(key => received.hasOwnProperty(key));

        if (pass) {
            return {
                message: () => `Expected object not to have all keys: ${expectedKeys.join(', ')}`,
                pass: true,
            };
        } else {
            const missingKeys = expectedKeys.filter(key => !received.hasOwnProperty(key));
            return {
                message: () => `Expected object to have keys: ${missingKeys.join(', ')}`,
                pass: false,
            };
        }
    },

    toBeValidProduct(received) {
        const requiredKeys = ['id', 'name', 'description', 'price'];
        const hasAllKeys = requiredKeys.every(key => received.hasOwnProperty(key));
        const hasValidPrice = typeof received.price === 'number' && received.price > 0;
        const hasValidId = typeof received.id === 'number' || typeof received.id === 'string';

        const pass = hasAllKeys && hasValidPrice && hasValidId;

        if (pass) {
            return {
                message: () => `Expected ${JSON.stringify(received)} not to be a valid product`,
                pass: true,
            };
        } else {
            return {
                message: () => `Expected ${JSON.stringify(received)} to be a valid product with id, name, description, and positive price`,
                pass: false,
            };
        }
    },

    toBeValidUser(received) {
        const requiredKeys = ['username', 'password', 'email'];
        const hasAllKeys = requiredKeys.every(key => received.hasOwnProperty(key));
        const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(received.email);

        const pass = hasAllKeys && hasValidEmail;

        if (pass) {
            return {
                message: () => `Expected ${JSON.stringify(received)} not to be a valid user`,
                pass: true,
            };
        } else {
            return {
                message: () => `Expected ${JSON.stringify(received)} to be a valid user with username, password, and valid email`,
                pass: false,
            };
        }
    },

    toBeValidCartItem(received) {
        const requiredKeys = ['productId', 'quantity'];
        const hasAllKeys = requiredKeys.every(key => received.hasOwnProperty(key));
        const hasValidQuantity = typeof received.quantity === 'number' && received.quantity > 0;
        const hasValidProductId = typeof received.productId === 'number' || typeof received.productId === 'string';

        const pass = hasAllKeys && hasValidQuantity && hasValidProductId;

        if (pass) {
            return {
                message: () => `Expected ${JSON.stringify(received)} not to be a valid cart item`,
                pass: true,
            };
        } else {
            return {
                message: () => `Expected ${JSON.stringify(received)} to be a valid cart item with productId and positive quantity`,
                pass: false,
            };
        }
    },

    toBeValidActivity(received) {
        const requiredKeys = ['username', 'activityType', 'timestamp'];
        const hasAllKeys = requiredKeys.every(key => received.hasOwnProperty(key));
        const hasValidTimestamp = !isNaN(Date.parse(received.timestamp));

        const pass = hasAllKeys && hasValidTimestamp;

        if (pass) {
            return {
                message: () => `Expected ${JSON.stringify(received)} not to be a valid activity`,
                pass: true,
            };
        } else {
            return {
                message: () => `Expected ${JSON.stringify(received)} to be a valid activity with username, activityType, and valid timestamp`,
                pass: false,
            };
        }
    }
});

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

beforeEach(() => {
    // Only show console output in verbose mode
    if (!process.env.JEST_VERBOSE) {
        console.error = jest.fn();
        console.log = jest.fn();
        console.warn = jest.fn();
    }
});

afterEach(() => {
    // Restore console methods
    if (!process.env.JEST_VERBOSE) {
        console.error = originalConsoleError;
        console.log = originalConsoleLog;
        console.warn = originalConsoleWarn;
    }
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Helper functions available in all tests
global.testHelpers = {
    // Generate random test data
    generateRandomString: (length = 10) => {
        return Math.random().toString(36).substring(2, 2 + length);
    },

    generateRandomEmail: () => {
        return `test${Math.random().toString(36).substring(2)}@example.com`;
    },

    generateRandomUser: () => {
        const id = Math.random().toString(36).substring(2);
        return {
            username: `testuser_${id}`,
            password: 'testPass123!',
            email: `testuser_${id}@example.com`
        };
    },

    // Wait for async operations
    wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    // Create mock request/response objects
    createMockReq: (overrides = {}) => ({
        body: {},
        params: {},
        query: {},
        headers: {},
        user: null,
        ...overrides
    }),

    createMockRes: () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        res.send = jest.fn().mockReturnValue(res);
        res.redirect = jest.fn().mockReturnValue(res);
        res.cookie = jest.fn().mockReturnValue(res);
        res.clearCookie = jest.fn().mockReturnValue(res);
        return res;
    }
};