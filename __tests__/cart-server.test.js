// Tests for cart-server.js module
// This demonstrates testing patterns for your Express modules

const request = require('supertest');
const cartServer = require('../screens/cart-server');

// Mock the persist module to isolate cart logic
jest.mock('../persist_module', () => ({
    loadCart: jest.fn(),
    saveCart: jest.fn(),
    logActivity: jest.fn()
}));

const persistModule = require('../persist_module');

describe('Cart Server Tests', () => {
    // Mock request and response objects
    let mockReq, mockRes;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Create fresh mock objects for each test
        mockReq = {
            cookies: { userToken: 'testuser' },
            body: {}
        };
        
        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
    });

    describe('addToCart', () => {
        it('should add new item to empty cart', async () => {
            // Arrange
            mockReq.body = { productId: 1, customization: null };
            persistModule.loadCart.mockResolvedValue([]);
            persistModule.saveCart.mockResolvedValue();
            persistModule.logActivity.mockResolvedValue();

            // Act
            await cartServer.addToCart(mockReq, mockRes);

            // Assert
            expect(persistModule.loadCart).toHaveBeenCalledWith('testuser');
            expect(persistModule.saveCart).toHaveBeenCalled();
            expect(persistModule.logActivity).toHaveBeenCalledWith(
                'testuser', 
                'add-to-cart', 
                { productId: 1, customization: null }
            );
            expect(mockRes.json).toHaveBeenCalledWith({ success: true });
        });

        it('should increase quantity for existing item without customization', async () => {
            // Arrange
            const existingCart = [
                { cartItemId: 123, productId: 1, quantity: 1, addedAt: '2024-01-01' }
            ];
            mockReq.body = { productId: 1 };
            persistModule.loadCart.mockResolvedValue(existingCart);
            persistModule.saveCart.mockResolvedValue();

            // Act  
            await cartServer.addToCart(mockReq, mockRes);

            // Assert - check that saveCart was called with updated quantity
            const saveCall = persistModule.saveCart.mock.calls[0];
            const updatedCart = saveCall[1];
            expect(updatedCart[0].quantity).toBe(2);
        });

        it('should add new item for customized products even if same productId exists', async () => {
            // Arrange
            const existingCart = [
                { cartItemId: 123, productId: 1, quantity: 1 }
            ];
            mockReq.body = { 
                productId: 1, 
                customization: { engraving: 'Custom Text' } 
            };
            persistModule.loadCart.mockResolvedValue(existingCart);
            persistModule.saveCart.mockResolvedValue();

            // Act
            await cartServer.addToCart(mockReq, mockRes);

            // Assert - should have 2 items now (original + customized)
            const saveCall = persistModule.saveCart.mock.calls[0];
            const updatedCart = saveCall[1];
            expect(updatedCart).toHaveLength(2);
            expect(updatedCart[1].customization).toEqual({ engraving: 'Custom Text' });
        });

        it('should handle errors gracefully', async () => {
            // Arrange
            mockReq.body = { productId: 1 };
            persistModule.loadCart.mockRejectedValue(new Error('Database error'));

            // Act
            await cartServer.addToCart(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to add to cart' });
        });
    });

    describe('getCart', () => {
        it('should return user cart with migrated cartItemIds', async () => {
            // Arrange - cart items without cartItemId (old format)
            const cartWithoutIds = [
                { productId: 1, quantity: 2 },
                { productId: 2, quantity: 1 }
            ];
            persistModule.loadCart.mockResolvedValue(cartWithoutIds);
            persistModule.saveCart.mockResolvedValue();

            // Act
            await cartServer.getCart(mockReq, mockRes);

            // Assert - should add cartItemIds and save
            expect(persistModule.saveCart).toHaveBeenCalled();
            const responseCall = mockRes.json.mock.calls[0][0];
            expect(responseCall[0]).toHaveProperty('cartItemId');
            expect(responseCall[1]).toHaveProperty('cartItemId');
        });

        it('should return cart without migration if cartItemIds exist', async () => {
            // Arrange - cart already has cartItemIds
            const cartWithIds = [
                { cartItemId: 123, productId: 1, quantity: 2 },
                { cartItemId: 456, productId: 2, quantity: 1 }
            ];
            persistModule.loadCart.mockResolvedValue(cartWithIds);

            // Act
            await cartServer.getCart(mockReq, mockRes);

            // Assert - should NOT call saveCart (no migration needed)
            expect(persistModule.saveCart).not.toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith(cartWithIds);
        });
    });

    describe('removeFromCart', () => {
        it('should remove item by cartItemId', async () => {
            // Arrange
            const cart = [
                { cartItemId: 123, productId: 1, quantity: 2 },
                { cartItemId: 456, productId: 2, quantity: 1 }
            ];
            mockReq.body = { itemId: 123 };
            persistModule.loadCart.mockResolvedValue(cart);
            persistModule.saveCart.mockResolvedValue();
            persistModule.logActivity.mockResolvedValue();

            // Act
            await cartServer.removeFromCart(mockReq, mockRes);

            // Assert
            const saveCall = persistModule.saveCart.mock.calls[0];
            const updatedCart = saveCall[1];
            expect(updatedCart).toHaveLength(1);
            expect(updatedCart[0].cartItemId).toBe(456);
        });
    });

    describe('updateCart', () => {
        it('should update item quantity', async () => {
            // Arrange
            const cart = [
                { cartItemId: 123, productId: 1, quantity: 2 }
            ];
            mockReq.body = { itemId: 123, quantity: 5 };
            persistModule.loadCart.mockResolvedValue(cart);
            persistModule.saveCart.mockResolvedValue();
            persistModule.logActivity.mockResolvedValue();

            // Act
            await cartServer.updateCart(mockReq, mockRes);

            // Assert
            const saveCall = persistModule.saveCart.mock.calls[0];
            const updatedCart = saveCall[1];
            expect(updatedCart[0].quantity).toBe(5);
        });

        it('should remove item when quantity is 0', async () => {
            // Arrange
            const cart = [
                { cartItemId: 123, productId: 1, quantity: 2 }
            ];
            mockReq.body = { itemId: 123, quantity: 0 };
            persistModule.loadCart.mockResolvedValue(cart);
            persistModule.saveCart.mockResolvedValue();

            // Act
            await cartServer.updateCart(mockReq, mockRes);

            // Assert
            const saveCall = persistModule.saveCart.mock.calls[0];
            const updatedCart = saveCall[1];
            expect(updatedCart).toHaveLength(0);
        });

        it('should return error for non-existent item', async () => {
            // Arrange
            const cart = [
                { cartItemId: 123, productId: 1, quantity: 2 }
            ];
            mockReq.body = { itemId: 999, quantity: 1 }; // Non-existent item
            persistModule.loadCart.mockResolvedValue(cart);

            // Act
            await cartServer.updateCart(mockReq, mockRes);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Item not found in cart' });
        });
    });

    describe('clearCart', () => {
        it('should clear all items from cart', async () => {
            // Arrange
            persistModule.saveCart.mockResolvedValue();

            // Act
            await cartServer.clearCart(mockReq, mockRes);

            // Assert
            expect(persistModule.saveCart).toHaveBeenCalledWith('testuser', []);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true });
        });
    });

    // Test for the bug in updateCustomization function
    describe('updateCustomization', () => {
        it('should identify the undefined cartItemId bug', async () => {
            // This test will fail and help you find the bug!
            const cart = [
                { cartItemId: 123, productId: 1, quantity: 1, customization: {} }
            ];
            mockReq.body = { productId: 1, customization: { engraving: 'New Text' } };
            persistModule.loadCart.mockResolvedValue(cart);

            // Act & Assert
            // This should fail because cartItemId is undefined in the function
            await expect(cartServer.updateCustomization(mockReq, mockRes)).rejects.toThrow();
        });
    });
});
