const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');

// Import the app after setting up test environment
process.env.NODE_ENV = 'test';

const app = require('../../server');

describe('API Integration Tests', () => {
    let authCookie = '';
    let testProductId = null;

    beforeAll(async () => {
        // Ensure test data directory exists
        await fs.mkdir(path.join(__dirname, '..', '..', 'data', 'user_data'), { recursive: true });
    });

    afterAll(async () => {
        // Cleanup test data files
        try {
            const testFiles = [
                'data/user_data/testuser_cart.json',
                'data/user_data/testuser_activity.json',
                'data/user_data/testuser_purchases.json',
                'data/user_data/testuser_wishlist.json'
            ];

            for (const file of testFiles) {
                try {
                    await fs.unlink(path.join(__dirname, '..', '..', file));
                } catch (error) {
                    // File might not exist, ignore error
                }
            }
        } catch (error) {
            console.log('Cleanup warning:', error.message);
        }
    });

    describe('Authentication Flow', () => {
        test('should register a new user', async () => {
            const response = await request(app)
                .post('/register')
                .send({
                    username: `testuser_${Date.now()}`,
                    password: 'testpass123',
                    email: 'test@example.com'
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.user).toBeDefined();
        });

        test('should reject duplicate username registration', async () => {
            const userData = {
                username: 'admin',
                password: 'newpass123',
                email: 'admin2@example.com'
            };

            const response = await request(app)
                .post('/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('already exists');
        });

        test('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/login')
                .send({
                    username: 'admin',
                    password: 'admin'
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.user).toBeDefined();

            // Store auth cookie for subsequent tests
            const cookies = response.headers['set-cookie'];
            if (cookies) {
                authCookie = cookies[0].split(';')[0];
            }
        });

        test('should reject login with invalid credentials', async () => {
            const response = await request(app)
                .post('/login')
                .send({
                    username: 'admin',
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        test('should get current user info when authenticated', async () => {
            const response = await request(app)
                .get('/api/current-user')
                .set('Cookie', authCookie)
                .expect(200);

            expect(response.body.username).toBe('admin');
        });

        test('should reject current user request when not authenticated', async () => {
            const response = await request(app)
                .get('/api/current-user')
                .expect(401);

            expect(response.body.error).toBeDefined();
        });
    });

    describe('Product Management', () => {
        test('should get all products', async () => {
            const response = await request(app)
                .get('/api/products')
                .set('Cookie', authCookie)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);

            const product = response.body[0];
            expect(product).toHaveProperty('id');
            expect(product).toHaveProperty('name');
            expect(product).toHaveProperty('price');
            expect(product).toHaveProperty('description');
        });

        test('should get specific product by ID', async () => {
            const productsResponse = await request(app)
                .get('/api/products')
                .set('Cookie', authCookie);

            const productId = productsResponse.body[0].id;

            const response = await request(app)
                .get(`/api/product/${productId}`)
                .set('Cookie', authCookie)
                .expect(200);

            expect(response.body.id).toBe(productId);
        });

        test('should handle non-existent product request', async () => {
            const response = await request(app)
                .get('/api/product/99999')
                .set('Cookie', authCookie)
                .expect(404);

            expect(response.body.error).toBeDefined();
        });

        test('should filter products by category', async () => {
            const response = await request(app)
                .post('/api/filter-products')
                .set('Cookie', authCookie)
                .send({ category: 'earrings' })
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            // All returned products should match the category filter
            response.body.forEach(product => {
                expect(product.name.toLowerCase()).toContain('earring');
            });
        });
    });

    describe('Cart Operations', () => {
        test('should start with empty cart', async () => {
            const response = await request(app)
                .get('/api/cart')
                .set('Cookie', authCookie)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(0);
        });

        test('should add item to cart', async () => {
            const productsResponse = await request(app)
                .get('/api/products')
                .set('Cookie', authCookie);

            const productId = productsResponse.body[0].id;

            const response = await request(app)
                .post('/api/cart/add')
                .set('Cookie', authCookie)
                .send({ productId, quantity: 2 })
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify item is in cart
            const cartResponse = await request(app)
                .get('/api/cart')
                .set('Cookie', authCookie);

            expect(cartResponse.body).toHaveLength(1);
            expect(cartResponse.body[0].productId).toBe(productId);
            expect(cartResponse.body[0].quantity).toBe(2);
        });

        test('should update cart item quantity', async () => {
            const cartResponse = await request(app)
                .get('/api/cart')
                .set('Cookie', authCookie);

            const cartItem = cartResponse.body[0];

            const response = await request(app)
                .post('/api/cart/update')
                .set('Cookie', authCookie)
                .send({ productId: cartItem.productId, quantity: 5 })
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify quantity was updated
            const updatedCartResponse = await request(app)
                .get('/api/cart')
                .set('Cookie', authCookie);

            expect(updatedCartResponse.body[0].quantity).toBe(5);
        });

        test('should remove item from cart', async () => {
            const cartResponse = await request(app)
                .get('/api/cart')
                .set('Cookie', authCookie);

            const cartItem = cartResponse.body[0];

            const response = await request(app)
                .post('/api/cart/remove')
                .set('Cookie', authCookie)
                .send({ productId: cartItem.productId })
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify item was removed
            const emptyCartResponse = await request(app)
                .get('/api/cart')
                .set('Cookie', authCookie);

            expect(emptyCartResponse.body).toHaveLength(0);
        });

        test('should clear entire cart', async () => {
            // First add an item
            const productsResponse = await request(app)
                .get('/api/products')
                .set('Cookie', authCookie);

            await request(app)
                .post('/api/cart/add')
                .set('Cookie', authCookie)
                .send({ productId: productsResponse.body[0].id, quantity: 1 });

            // Clear cart
            const response = await request(app)
                .post('/api/cart/clear')
                .set('Cookie', authCookie)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify cart is empty
            const cartResponse = await request(app)
                .get('/api/cart')
                .set('Cookie', authCookie);

            expect(cartResponse.body).toHaveLength(0);
        });
    });

    describe('Wishlist Operations', () => {
        test('should start with empty wishlist', async () => {
            const response = await request(app)
                .get('/api/wishlist')
                .set('Cookie', authCookie)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        test('should add item to wishlist', async () => {
            const productsResponse = await request(app)
                .get('/api/products')
                .set('Cookie', authCookie);

            const productId = productsResponse.body[0].id;

            const response = await request(app)
                .post('/api/wishlist/add')
                .set('Cookie', authCookie)
                .send({ productId })
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        test('should toggle wishlist item', async () => {
            const productsResponse = await request(app)
                .get('/api/products')
                .set('Cookie', authCookie);

            const productId = productsResponse.body[1].id;

            // Toggle on (add)
            const addResponse = await request(app)
                .post('/api/wishlist/toggle')
                .set('Cookie', authCookie)
                .send({ productId })
                .expect(200);

            expect(addResponse.body.success).toBe(true);
            expect(addResponse.body.action).toBe('added');

            // Toggle off (remove)
            const removeResponse = await request(app)
                .post('/api/wishlist/toggle')
                .set('Cookie', authCookie)
                .send({ productId })
                .expect(200);

            expect(removeResponse.body.success).toBe(true);
            expect(removeResponse.body.action).toBe('removed');
        });

        test('should remove item from wishlist', async () => {
            const wishlistResponse = await request(app)
                .get('/api/wishlist')
                .set('Cookie', authCookie);

            if (wishlistResponse.body.length > 0) {
                const productId = wishlistResponse.body[0];

                const response = await request(app)
                    .post('/api/wishlist/remove')
                    .set('Cookie', authCookie)
                    .send({ productId })
                    .expect(200);

                expect(response.body.success).toBe(true);
            }
        });
    });

    describe('Checkout Process', () => {
        test('should complete checkout with valid data', async () => {
            // First add item to cart
            const productsResponse = await request(app)
                .get('/api/products')
                .set('Cookie', authCookie);

            await request(app)
                .post('/api/cart/add')
                .set('Cookie', authCookie)
                .send({ productId: productsResponse.body[0].id, quantity: 1 });

            // Proceed with checkout
            const checkoutData = {
                customerInfo: {
                    fullName: 'Test User',
                    email: 'test@example.com',
                    phone: '123-456-7890',
                    address: '123 Test St',
                    city: 'Test City',
                    zipCode: '12345',
                    country: 'Test Country'
                },
                paymentInfo: {
                    cardName: 'Test User',
                    cardNumber: '4111111111111111',
                    expiry: '12/25',
                    cvv: '123'
                }
            };

            const response = await request(app)
                .post('/api/checkout')
                .set('Cookie', authCookie)
                .send(checkoutData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.orderId).toBeDefined();

            // Verify cart is cleared after successful checkout
            const cartResponse = await request(app)
                .get('/api/cart')
                .set('Cookie', authCookie);

            expect(cartResponse.body).toHaveLength(0);
        });

        test('should reject checkout with empty cart', async () => {
            const checkoutData = {
                customerInfo: {
                    fullName: 'Test User',
                    email: 'test@example.com'
                },
                paymentInfo: {
                    cardNumber: '4111111111111111'
                }
            };

            const response = await request(app)
                .post('/api/checkout')
                .set('Cookie', authCookie)
                .send(checkoutData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('empty');
        });

        test('should get purchase history', async () => {
            const response = await request(app)
                .get('/api/purchases')
                .set('Cookie', authCookie)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('Admin Operations', () => {
        test('should get all users (admin only)', async () => {
            const response = await request(app)
                .get('/api/admin/users')
                .set('Cookie', authCookie)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        test('should get user activities', async () => {
            const response = await request(app)
                .get('/api/admin/activity/admin')
                .set('Cookie', authCookie)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        test('should add new product', async () => {
            const productData = {
                name: 'Test Integration Product',
                description: 'A product created during integration testing',
                price: 199.99,
                category: 'test',
                customizable: false,
                stock: 50
            };

            const response = await request(app)
                .post('/api/admin/product')
                .set('Cookie', authCookie)
                .send(productData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.product).toBeDefined();
            expect(response.body.product.name).toBe(productData.name);

            testProductId = response.body.product.id;
        });

        test('should update existing product', async () => {
            if (testProductId) {
                const updateData = {
                    id: testProductId,
                    name: 'Updated Test Product',
                    price: 299.99
                };

                const response = await request(app)
                    .post('/api/admin/product')
                    .set('Cookie', authCookie)
                    .send(updateData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.product.name).toBe('Updated Test Product');
            }
        });

        test('should delete product', async () => {
            if (testProductId) {
                const response = await request(app)
                    .delete(`/api/admin/product/${testProductId}`)
                    .set('Cookie', authCookie)
                    .expect(200);

                expect(response.body.success).toBe(true);

                // Verify product is deleted
                const getResponse = await request(app)
                    .get(`/api/product/${testProductId}`)
                    .set('Cookie', authCookie)
                    .expect(404);
            }
        });
    });

    describe('Contact Form', () => {
        test('should submit contact form successfully', async () => {
            const contactData = {
                name: 'Integration Test User',
                email: 'integration@test.com',
                message: 'This is a test message from integration tests'
            };

            const response = await request(app)
                .post('/api/contact')
                .send(contactData)
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        test('should validate contact form data', async () => {
            const invalidContactData = {
                name: '',
                email: 'invalid-email',
                message: ''
            };

            const response = await request(app)
                .post('/api/contact')
                .send(invalidContactData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        test('should handle malformed JSON', async () => {
            const response = await request(app)
                .post('/api/cart/add')
                .set('Cookie', authCookie)
                .set('Content-Type', 'application/json')
                .send('{ invalid json }')
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('should require authentication for protected routes', async () => {
            const protectedRoutes = [
                { method: 'get', path: '/api/cart' },
                { method: 'post', path: '/api/cart/add' },
                { method: 'get', path: '/api/wishlist' },
                { method: 'post', path: '/api/checkout' },
                { method: 'get', path: '/api/admin/users' }
            ];

            for (const route of protectedRoutes) {
                const response = await request(app)[route.method](route.path)
                    .expect(401);

                expect(response.body.error).toBeDefined();
            }
        });

        test('should handle SQL injection attempts', async () => {
            const maliciousInput = "'; DROP TABLE products; --";

            const response = await request(app)
                .get(`/api/products?search=${encodeURIComponent(maliciousInput)}`)
                .set('Cookie', authCookie)
                .expect(200);

            // Should return normal response, not cause database issues
            expect(Array.isArray(response.body)).toBe(true);
        });

        test('should handle concurrent cart operations', async () => {
            const productsResponse = await request(app)
                .get('/api/products')
                .set('Cookie', authCookie);

            const productId = productsResponse.body[0].id;

            // Simulate concurrent add operations
            const promises = Array(5).fill().map(() =>
                request(app)
                    .post('/api/cart/add')
                    .set('Cookie', authCookie)
                    .send({ productId, quantity: 1 })
            );

            const responses = await Promise.all(promises);

            // All should succeed or handle gracefully
            responses.forEach(response => {
                expect([200, 409]).toContain(response.status); // Success or conflict
            });
        });
    });

    describe('Session Management', () => {
        test('should logout successfully', async () => {
            const response = await request(app)
                .post('/logout')
                .set('Cookie', authCookie)
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        test('should require re-authentication after logout', async () => {
            const response = await request(app)
                .get('/api/current-user')
                .set('Cookie', authCookie)
                .expect(401);

            expect(response.body.error).toBeDefined();
        });
    });
});