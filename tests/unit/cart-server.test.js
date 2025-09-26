const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const persistModule = require('../../persist_module');

// Mock the persist module
jest.mock('../../persist_module');

describe('Cart Server Unit Tests', () => {
    let app;
    let cartRouter;

    beforeEach(() => {
        jest.clearAllMocks();

        // Create a test app with the cart routes
        app = express();
        app.use(express.json());
        app.use(cookieParser());

        // Mock authentication middleware
        app.use((req, res, next) => {
            req.user = { username: 'testuser' }; // Mock authenticated user
            next();
        });

        // Import and use cart routes after mocks are set up
        cartRouter = require('../../screens/cart-server');
        app.use('/api/cart', cartRouter);
    });

    afterEach(() => {
        // Clear module cache to ensure fresh imports
        delete require.cache[require.resolve('../../screens/cart-server')];
        jest.restoreAllMocks();
    });

    describe('GET /api/cart', () => {
        test('should return user cart successfully', async () => {
            const mockCart = [
                { productId: 1, quantity: 2, addedAt: '2023-01-01' }
            ];

            persistModule.getUserCart.mockResolvedValue(mockCart);

            const response = await request(app)
                .get('/api/cart')
                .expect(200);

            expect(response.body).toEqual(mockCart);
            expect(persistModule.getUserCart).toHaveBeenCalledWith('testuser');
        });

        test('should handle errors when loading cart', async () => {
            persistModule.getUserCart.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .get('/api/cart')
                .expect(500);

            expect(response.body.error).toBeDefined();
        });
    });

    describe('POST /api/cart', () => {
        test('should add item to cart successfully', async () => {
            const mockProducts = [
                { id: 1, name: 'Test Product', price: 99.99, stock: 10 }
            ];
            const existingCart = [];

            persistModule.loadProducts.mockResolvedValue(mockProducts);
            persistModule.getUserCart.mockResolvedValue(existingCart);
            persistModule.saveUserCart.mockResolvedValue();
            persistModule.logActivity.mockResolvedValue();

            const response = await request(app)
                .post('/api/cart')
                .send({ productId: 1, quantity: 2 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(persistModule.saveUserCart).toHaveBeenCalledWith(
                'testuser',
                expect.arrayContaining([
                    expect.objectContaining({
                        productId: 1,
                        quantity: 2
                    })
                ])
            );
            expect(persistModule.logActivity).toHaveBeenCalledWith(
                'testuser',
                'add_to_cart',
                expect.any(Object)
            );
        });

        test('should reject adding invalid product to cart', async () => {
            persistModule.loadProducts.mockResolvedValue([]);

            const response = await request(app)
                .post('/api/cart')
                .send({ productId: 999, quantity: 1 })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Product not found');
        });

        test('should reject adding item with insufficient stock', async () => {
            const mockProducts = [
                { id: 1, name: 'Test Product', price: 99.99, stock: 1 }
            ];

            persistModule.loadProducts.mockResolvedValue(mockProducts);
            persistModule.getUserCart.mockResolvedValue([]);

            const response = await request(app)
                .post('/api/cart')
                .send({ productId: 1, quantity: 5 })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Insufficient stock');
        });

        test('should update quantity if item already exists in cart', async () => {
            const mockProducts = [
                { id: 1, name: 'Test Product', price: 99.99, stock: 10 }
            ];
            const existingCart = [
                { productId: 1, quantity: 2, addedAt: '2023-01-01' }
            ];

            persistModule.loadProducts.mockResolvedValue(mockProducts);
            persistModule.getUserCart.mockResolvedValue(existingCart);
            persistModule.saveUserCart.mockResolvedValue();
            persistModule.logActivity.mockResolvedValue();

            const response = await request(app)
                .post('/api/cart')
                .send({ productId: 1, quantity: 3 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(persistModule.saveUserCart).toHaveBeenCalledWith(
                'testuser',
                expect.arrayContaining([
                    expect.objectContaining({
                        productId: 1,
                        quantity: 5 // 2 + 3
                    })
                ])
            );
        });

        test('should validate request data', async () => {
            const response = await request(app)
                .post('/api/cart')
                .send({}) // Missing productId
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Product ID is required');
        });

        test('should default quantity to 1 if not provided', async () => {
            const mockProducts = [
                { id: 1, name: 'Test Product', price: 99.99, stock: 10 }
            ];

            persistModule.loadProducts.mockResolvedValue(mockProducts);
            persistModule.getUserCart.mockResolvedValue([]);
            persistModule.saveUserCart.mockResolvedValue();
            persistModule.logActivity.mockResolvedValue();

            const response = await request(app)
                .post('/api/cart')
                .send({ productId: 1 }) // No quantity provided
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(persistModule.saveUserCart).toHaveBeenCalledWith(
                'testuser',
                expect.arrayContaining([
                    expect.objectContaining({
                        productId: 1,
                        quantity: 1 // Default quantity
                    })
                ])
            );
        });
    });

    describe('PUT /api/cart/:productId', () => {
        test('should update cart item quantity', async () => {
            const existingCart = [
                { productId: 1, quantity: 2, addedAt: '2023-01-01' },
                { productId: 2, quantity: 1, addedAt: '2023-01-02' }
            ];

            persistModule.getUserCart.mockResolvedValue(existingCart);
            persistModule.saveUserCart.mockResolvedValue();
            persistModule.logActivity.mockResolvedValue();

            const response = await request(app)
                .put('/api/cart/1')
                .send({ quantity: 5 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(persistModule.saveUserCart).toHaveBeenCalledWith(
                'testuser',
                expect.arrayContaining([
                    expect.objectContaining({
                        productId: 1,
                        quantity: 5
                    }),
                    expect.objectContaining({
                        productId: 2,
                        quantity: 1
                    })
                ])
            );
        });

        test('should remove item when quantity is 0', async () => {
            const existingCart = [
                { productId: 1, quantity: 2, addedAt: '2023-01-01' },
                { productId: 2, quantity: 1, addedAt: '2023-01-02' }
            ];

            persistModule.getUserCart.mockResolvedValue(existingCart);
            persistModule.saveUserCart.mockResolvedValue();
            persistModule.logActivity.mockResolvedValue();

            const response = await request(app)
                .put('/api/cart/1')
                .send({ quantity: 0 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(persistModule.saveUserCart).toHaveBeenCalledWith(
                'testuser',
                expect.arrayContaining([
                    expect.objectContaining({
                        productId: 2,
                        quantity: 1
                    })
                ])
            );
            // Should not contain productId 1 anymore
            const savedCart = persistModule.saveUserCart.mock.calls[0][1];
            expect(savedCart.find(item => item.productId === 1)).toBeUndefined();
        });

        test('should reject update for non-existent cart item', async () => {
            persistModule.getUserCart.mockResolvedValue([]);

            const response = await request(app)
                .put('/api/cart/999')
                .send({ quantity: 1 })
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Item not found');
        });

        test('should validate quantity parameter', async () => {
            const response = await request(app)
                .put('/api/cart/1')
                .send({ quantity: -1 })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Invalid quantity');
        });
    });

    describe('DELETE /api/cart/:productId', () => {
        test('should remove item from cart', async () => {
            const existingCart = [
                { productId: 1, quantity: 2, addedAt: '2023-01-01' },
                { productId: 2, quantity: 1, addedAt: '2023-01-02' }
            ];

            persistModule.getUserCart.mockResolvedValue(existingCart);
            persistModule.saveUserCart.mockResolvedValue();
            persistModule.logActivity.mockResolvedValue();

            const response = await request(app)
                .delete('/api/cart/1')
                .expect(200);

            expect(response.body.success).toBe(true);
            const savedCart = persistModule.saveUserCart.mock.calls[0][1];
            expect(savedCart).toHaveLength(1);
            expect(savedCart[0].productId).toBe(2);
        });

        test('should handle removing non-existent item gracefully', async () => {
            persistModule.getUserCart.mockResolvedValue([]);

            const response = await request(app)
                .delete('/api/cart/999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Item not found');
        });
    });

    describe('DELETE /api/cart', () => {
        test('should clear entire cart', async () => {
            persistModule.saveUserCart.mockResolvedValue();
            persistModule.logActivity.mockResolvedValue();

            const response = await request(app)
                .delete('/api/cart')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(persistModule.saveUserCart).toHaveBeenCalledWith('testuser', []);
            expect(persistModule.logActivity).toHaveBeenCalledWith(
                'testuser',
                'clear_cart',
                expect.any(Object)
            );
        });
    });

    describe('Error Handling', () => {
        test('should handle database errors gracefully', async () => {
            persistModule.getUserCart.mockRejectedValue(new Error('Database connection failed'));

            const response = await request(app)
                .get('/api/cart')
                .expect(500);

            expect(response.body.error).toBeDefined();
            expect(response.body.success).toBe(false);
        });

        test('should handle invalid JSON in request body', async () => {
            const response = await request(app)
                .post('/api/cart')
                .send('invalid json')
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Authentication', () => {
        test('should require authenticated user', () => {
            // Create app without authentication middleware
            const unauthApp = express();
            unauthApp.use(express.json());
            unauthApp.use('/api/cart', cartRouter);

            return request(unauthApp)
                .get('/api/cart')
                .expect(401);
        });
    });
});