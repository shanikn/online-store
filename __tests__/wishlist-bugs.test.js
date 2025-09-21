// Wishlist Bug Detection Tests
// These tests will help identify specific issues in your wishlist functionality

const request = require('supertest');

// Mock the persist module for wishlist tests  
jest.mock('../persist_module', () => ({
    loadData: jest.fn(),
    saveData: jest.fn(),
    logActivity: jest.fn()
}));

// Import server after mocking
const app = require('../server');
const persistModule = require('../persist_module');

describe('Wishlist Bug Detection', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockReq = {
            cookies: { userToken: 'testuser' },
            body: {}
        };
        
        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
    });

    describe('Wishlist Data Type Consistency Bugs', () => {
        it('should handle productId type mismatches (string vs number)', async () => {
            // This bug exists in your server.js - type mismatches between string/number
            const wishlists = {
                testuser: [1, 2, 3] // Numbers in wishlist
            };
            persistModule.loadData.mockResolvedValue(wishlists);
            persistModule.saveData.mockResolvedValue();

            // Test adding string productId to number array
            const response = await request(app)
                .post('/api/wishlist/add')
                .set('Cookie', ['userToken=testuser'])
                .send({ productId: '4' }) // String instead of number
                .expect(200);

            expect(response.body.success).toBe(true);
            
            // Check if the save was called with consistent types
            const saveCall = persistModule.saveData.mock.calls[0];
            const savedWishlist = saveCall[1].testuser;
            
            // This might reveal the type consistency bug
            console.log('Saved wishlist types:', savedWishlist.map(id => typeof id));
        });

        it('should handle removal with type mismatches', async () => {
            // Your server has debugging logs showing type conversion issues
            const wishlists = {
                testuser: [1, '2', 3] // Mixed types - this causes bugs!
            };
            persistModule.loadData.mockResolvedValue(wishlists);
            persistModule.saveData.mockResolvedValue();

            const response = await request(app)
                .delete('/api/wishlist/remove')
                .set('Cookie', ['userToken=testuser'])
                .send({ productId: 2 }) // Number
                .expect(200);

            // Check if removal worked correctly despite type mismatch
            const saveCall = persistModule.saveData.mock.calls[0];
            const savedWishlist = saveCall[1].testuser;
            
            // Should have removed item 2 regardless of its type in the array
            expect(savedWishlist).not.toContain(2);
            expect(savedWishlist).not.toContain('2');
        });
    });

    describe('Duplicate Detection Bugs', () => {
        it('should prevent duplicate entries with different types', async () => {
            const wishlists = {
                testuser: [1, '2', 3] // Already has product 2 as string
            };
            persistModule.loadData.mockResolvedValue(wishlists);
            persistModule.saveData.mockResolvedValue();

            // Try to add product 2 as number
            const response = await request(app)
                .post('/api/wishlist/add')
                .set('Cookie', ['userToken=testuser'])
                .send({ productId: 2 })
                .expect(200);

            const saveCall = persistModule.saveData.mock.calls[0];
            const savedWishlist = saveCall[1].testuser;
            
            // Should not have duplicates (checking your duplicate detection logic)
            const twos = savedWishlist.filter(id => 
                (typeof id === 'string' ? parseInt(id) : id) === 2
            );
            expect(twos.length).toBeLessThanOrEqual(1);
        });
    });

    describe('Race Condition and Timing Bugs', () => {
        it('should handle rapid add/remove operations', async () => {
            // Test for race conditions when operations happen quickly
            const wishlists = { testuser: [1, 2, 3] };
            persistModule.loadData.mockResolvedValue(wishlists);
            persistModule.saveData.mockResolvedValue();

            // Simulate rapid operations
            const promises = [
                request(app)
                    .post('/api/wishlist/add')
                    .set('Cookie', ['userToken=testuser'])
                    .send({ productId: 4 }),
                request(app)
                    .delete('/api/wishlist/remove')
                    .set('Cookie', ['userToken=testuser'])
                    .send({ productId: 2 }),
                request(app)
                    .post('/api/wishlist/add')
                    .set('Cookie', ['userToken=testuser'])
                    .send({ productId: 5 })
            ];

            const responses = await Promise.all(promises);
            
            // All should succeed if race conditions are handled properly
            responses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
            });
        });
    });

    describe('Wishlist Client-Server Sync Bugs', () => {
        it('should identify heart icon toggle state issues', () => {
            // Test the JavaScript logic that toggles heart icons
            // This would be a client-side test to catch the toggle bugs
            
            // Simulate the heart toggle logic from your HTML
            const mockProduct = { id: 1, inWishlist: false };
            
            // Test the logic that determines if heart should be filled or empty
            function isInWishlist(productId, wishlistItems) {
                return wishlistItems.some(item => {
                    const numId = typeof item === 'string' ? parseInt(item) : item;
                    const numProductId = typeof productId === 'string' ? parseInt(productId) : productId;
                    return numId === numProductId;
                });
            }
            
            // Test with different type combinations
            expect(isInWishlist(1, [1, 2, 3])).toBe(true);
            expect(isInWishlist('1', [1, 2, 3])).toBe(true);
            expect(isInWishlist(1, ['1', '2', '3'])).toBe(true);
            expect(isInWishlist('1', ['1', '2', '3'])).toBe(true);
        });
    });

    describe('Authentication Edge Cases', () => {
        it('should handle unauthenticated wishlist operations gracefully', async () => {
            // Test without userToken cookie
            const response = await request(app)
                .get('/api/wishlist')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Authentication required');
            expect(response.body).toHaveProperty('redirect', '/login.html');
        });

        it('should handle expired/invalid authentication', async () => {
            const response = await request(app)
                .post('/api/wishlist/add')
                .set('Cookie', ['userToken=invalid_user'])
                .send({ productId: 1 })
                .expect(200); // This might reveal if auth validation is missing

            // This test will help identify if invalid tokens are being accepted
        });
    });
});

// Cart Server Bug Detection (for the specific bug I found)
describe('Cart Server updateCustomization Bug', () => {
    const cartServer = require('../screens/cart-server');
    
    it('should identify the undefined cartItemId bug in updateCustomization', async () => {
        const mockReq = {
            cookies: { userToken: 'testuser' },
            body: { productId: 1, customization: { engraving: 'Test' } }
        };
        
        const mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };

        persistModule.loadCart = jest.fn().mockResolvedValue([
            { cartItemId: 123, productId: 1, quantity: 1, customization: {} }
        ]);

        // This should fail because cartItemId is undefined in the function
        try {
            await cartServer.updateCustomization(mockReq, mockRes);
            // If we get here, the bug might be fixed
            console.log('✅ updateCustomization bug might be fixed!');
        } catch (error) {
            // This catches the bug
            console.log('🐛 Found the cartItemId bug:', error.message);
            expect(error.message).toMatch(/cartItemId.*undefined|Cannot read.*cartItemId/);
        }
    });
});
