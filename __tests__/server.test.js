// Basic server integration tests
// Tests the main Express application setup

const request = require('supertest');

// Mock the persist module for server tests
jest.mock('../persist_module', () => ({
    loadUsers: jest.fn(),
    saveUsers: jest.fn(),
    loadData: jest.fn(),
    saveData: jest.fn(),
    loadCart: jest.fn(),
    saveCart: jest.fn(),
    logActivity: jest.fn(),
    getPurchases: jest.fn()
}));

// Import server after mocking persist
const app = require('../server');

describe('Server Integration Tests', () => {
    describe('Basic Routes', () => {
        it('should redirect root to store.html', async () => {
            const response = await request(app)
                .get('/')
                .expect(302);
            
            expect(response.headers.location).toBe('/store.html');
        });

        it('should serve store.html for public access', async () => {
            const response = await request(app)
                .get('/store.html')
                .expect(200);
            
            expect(response.headers['content-type']).toMatch(/html/);
        });

        it('should return 404 for non-existent routes', async () => {
            await request(app)
                .get('/non-existent-route')
                .expect(404);
        });
    });

    describe('API Routes - Public Access', () => {
        it('should allow public access to products API', async () => {
            // Mock products data
            const mockProducts = [
                createTestProduct(1, 'Gold Ring'),
                createTestProduct(2, 'Silver Necklace')
            ];
            
            require('../persist_module').loadData.mockResolvedValue(mockProducts);

            const response = await request(app)
                .get('/api/products')
                .expect(200);
            
            expect(response.body).toEqual(mockProducts);
        });

        it('should allow public search without authentication', async () => {
            require('../persist_module').loadData.mockResolvedValue([
                createTestProduct(1, 'Gold Ring'),
                createTestProduct(2, 'Silver Necklace')
            ]);

            const response = await request(app)
                .get('/api/products/search?q=gold')
                .expect(200);
            
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('Protected Routes - Authentication Required', () => {
        it('should redirect to login for cart.html without auth', async () => {
            const response = await request(app)
                .get('/cart.html')
                .expect(302);
            
            expect(response.headers.location).toBe('/login.html');
        });

        it('should return 401 for cart API without auth', async () => {
            const response = await request(app)
                .get('/api/cart')
                .expect(401);
            
            expect(response.body).toHaveProperty('error', 'Authentication required');
        });

        it('should return 401 for admin API without auth', async () => {
            const response = await request(app)
                .get('/api/admin/activities')
                .expect(401);
            
            expect(response.body).toHaveProperty('error', 'Authentication required');
        });
    });

    describe('Rate Limiting', () => {
        it('should apply rate limiting after many requests', async () => {
            // This test demonstrates the rate limiting feature
            // Note: This might be slow as it makes many requests
            
            const promises = [];
            for (let i = 0; i < 102; i++) { // Exceed the 100 request limit
                promises.push(
                    request(app)
                        .get('/api/products')
                        .catch(err => err.response) // Catch rate limit errors
                );
            }
            
            const responses = await Promise.all(promises);
            
            // Some of the later requests should be rate limited (429)
            const rateLimitedResponses = responses.filter(res => 
                res && res.status === 429
            );
            
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
        }, 15000); // Longer timeout for this test
    });

    describe('Error Handling', () => {
        it('should handle server errors gracefully', async () => {
            // Force an error by making persist module throw
            require('../persist_module').loadData.mockRejectedValue(
                new Error('Database connection failed')
            );

            const response = await request(app)
                .get('/api/products')
                .expect(500);
            
            expect(response.body).toHaveProperty('error');
        });
    });

    describe('Authentication Simulation', () => {
        it('should allow access with valid userToken cookie', async () => {
            // Mock user data
            require('../persist_module').loadUsers.mockResolvedValue([
                createTestUser('testuser')
            ]);
            require('../persist_module').loadCart.mockResolvedValue([]);

            const response = await request(app)
                .get('/api/cart')
                .set('Cookie', ['userToken=testuser'])
                .expect(200);
            
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
});

// Helper to test specific bugs/issues
describe('Bug Detection Tests', () => {
    it('should catch undefined variable issues', () => {
        // Example of testing for undefined variables
        const testFunction = () => {
            let undefinedVar;
            return undefinedVar.someMethod(); // This will throw
        };
        
        expect(testFunction).toThrow();
    });

    it('should validate required request body fields', async () => {
        const response = await request(app)
            .post('/api/cart/add')
            .set('Cookie', ['userToken=testuser'])
            .send({}) // Empty body - should validate required fields
            .expect(500); // Might fail due to missing productId
        
        // This test helps identify missing validation
    });
});
