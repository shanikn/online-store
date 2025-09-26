const request = require('supertest');
const fs = require('fs').promises;
const path = require('path');

// Set test environment
process.env.NODE_ENV = 'test';

const app = require('../../server');

describe('End-to-End User Flow Tests', () => {
    let testUserId;
    let authCookie;
    let adminCookie;
    let testProductIds = [];

    beforeAll(async () => {
        // Ensure test data directories exist
        await fs.mkdir(path.join(__dirname, '..', '..', 'data', 'user_data'), { recursive: true });

        // Login as admin for setup
        const adminLogin = await request(app)
            .post('/login')
            .send({ username: 'admin', password: 'admin' });

        if (adminLogin.body.success) {
            adminCookie = adminLogin.headers['set-cookie'][0].split(';')[0];
        }
    });

    afterAll(async () => {
        // Cleanup test files
        const testFiles = [
            'data/user_data/e2e_test_user_cart.json',
            'data/user_data/e2e_test_user_activity.json',
            'data/user_data/e2e_test_user_purchases.json',
            'data/user_data/e2e_test_user_wishlist.json'
        ];

        for (const file of testFiles) {
            try {
                await fs.unlink(path.join(__dirname, '..', '..', file));
            } catch (error) {
                // Ignore if file doesn't exist
            }
        }
    });

    describe('Complete User Registration and Shopping Flow', () => {
        test('Step 1: New user registration', async () => {
            const userData = {
                username: 'e2e_test_user',
                password: 'testPassword123!',
                email: 'e2etest@example.com',
                remember: false
            };

            const response = await request(app)
                .post('/register')
                .send(userData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.user.username).toBe(userData.username);
            expect(response.body.user.email).toBe(userData.email);

            testUserId = response.body.user.username;
        });

        test('Step 2: User login after registration', async () => {
            const response = await request(app)
                .post('/login')
                .send({
                    username: 'e2e_test_user',
                    password: 'testPassword123!',
                    remember: false
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.user.username).toBe('e2e_test_user');

            // Store authentication cookie
            authCookie = response.headers['set-cookie'][0].split(';')[0];
        });

        test('Step 3: Browse products catalog', async () => {
            const response = await request(app)
                .get('/api/products')
                .set('Cookie', authCookie)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);

            // Store first few product IDs for testing
            testProductIds = response.body.slice(0, 3).map(p => p.id);
        });

        test('Step 4: Search for specific products', async () => {
            const response = await request(app)
                .post('/api/filter-products')
                .set('Cookie', authCookie)
                .send({ category: 'earrings' })
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(product => {
                expect(product.name.toLowerCase()).toMatch(/(earring|stud)/);
            });
        });

        test('Step 5: Add multiple items to wishlist', async () => {
            for (const productId of testProductIds) {
                const response = await request(app)
                    .post('/api/wishlist/add')
                    .set('Cookie', authCookie)
                    .send({ productId })
                    .expect(200);

                expect(response.body.success).toBe(true);
            }

            // Verify all items are in wishlist
            const wishlistResponse = await request(app)
                .get('/api/wishlist')
                .set('Cookie', authCookie)
                .expect(200);

            expect(wishlistResponse.body.length).toBe(testProductIds.length);
        });

        test('Step 6: Move items from wishlist to cart', async () => {
            // Add first two wishlist items to cart
            for (let i = 0; i < 2; i++) {
                const productId = testProductIds[i];

                const addToCartResponse = await request(app)
                    .post('/api/cart/add')
                    .set('Cookie', authCookie)
                    .send({ productId, quantity: i + 1 })
                    .expect(200);

                expect(addToCartResponse.body.success).toBe(true);

                // Remove from wishlist
                const removeFromWishlistResponse = await request(app)
                    .post('/api/wishlist/remove')
                    .set('Cookie', authCookie)
                    .send({ productId })
                    .expect(200);

                expect(removeFromWishlistResponse.body.success).toBe(true);
            }

            // Verify cart contents
            const cartResponse = await request(app)
                .get('/api/cart')
                .set('Cookie', authCookie)
                .expect(200);

            expect(cartResponse.body.length).toBe(2);
            expect(cartResponse.body[0].quantity).toBe(1);
            expect(cartResponse.body[1].quantity).toBe(2);
        });

        test('Step 7: Modify cart contents', async () => {
            const cartResponse = await request(app)
                .get('/api/cart')
                .set('Cookie', authCookie);

            const firstItem = cartResponse.body[0];

            // Update quantity of first item
            const updateResponse = await request(app)
                .post('/api/cart/update')
                .set('Cookie', authCookie)
                .send({ productId: firstItem.productId, quantity: 3 })
                .expect(200);

            expect(updateResponse.body.success).toBe(true);

            // Remove second item
            const secondItem = cartResponse.body[1];
            const removeResponse = await request(app)
                .post('/api/cart/remove')
                .set('Cookie', authCookie)
                .send({ productId: secondItem.productId })
                .expect(200);

            expect(removeResponse.body.success).toBe(true);

            // Verify cart has one item with quantity 3
            const updatedCartResponse = await request(app)
                .get('/api/cart')
                .set('Cookie', authCookie);

            expect(updatedCartResponse.body.length).toBe(1);
            expect(updatedCartResponse.body[0].quantity).toBe(3);
        });

        test('Step 8: Add more items and proceed to checkout', async () => {
            // Add third product to cart
            const response = await request(app)
                .post('/api/cart/add')
                .set('Cookie', authCookie)
                .send({ productId: testProductIds[2], quantity: 1 })
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify cart has 2 items now
            const cartResponse = await request(app)
                .get('/api/cart')
                .set('Cookie', authCookie);

            expect(cartResponse.body.length).toBe(2);
        });

        test('Step 9: Complete checkout process', async () => {
            const checkoutData = {
                customerInfo: {
                    fullName: 'E2E Test User',
                    email: 'e2etest@example.com',
                    phone: '+1-555-0123',
                    address: '123 Test Street, Apt 4B',
                    city: 'Test City',
                    zipCode: '12345',
                    country: 'United States'
                },
                paymentInfo: {
                    cardName: 'E2E Test User',
                    cardNumber: '4111111111111111',
                    expiry: '12/25',
                    cvv: '123'
                },
                deliveryOptions: {
                    method: 'standard',
                    notes: 'Please ring the doorbell'
                }
            };

            const response = await request(app)
                .post('/api/checkout')
                .set('Cookie', authCookie)
                .send(checkoutData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.orderId).toBeDefined();
            expect(response.body.total).toBeGreaterThan(0);

            // Verify cart is now empty
            const cartResponse = await request(app)
                .get('/api/cart')
                .set('Cookie', authCookie);

            expect(cartResponse.body.length).toBe(0);
        });

        test('Step 10: View purchase history', async () => {
            const response = await request(app)
                .get('/api/purchases')
                .set('Cookie', authCookie)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);

            const purchase = response.body[0];
            expect(purchase.id).toBeDefined();
            expect(purchase.timestamp).toBeDefined();
            expect(purchase.total).toBeGreaterThan(0);
            expect(Array.isArray(purchase.items)).toBe(true);
        });

        test('Step 11: Submit contact form', async () => {
            const contactData = {
                name: 'E2E Test User',
                email: 'e2etest@example.com',
                subject: 'Order Inquiry',
                message: 'I would like to ask about my recent order. When will it be shipped?'
            };

            const response = await request(app)
                .post('/api/contact')
                .send(contactData)
                .expect(200);

            expect(response.body.success).toBe(true);
        });

        test('Step 12: User logout', async () => {
            const response = await request(app)
                .post('/logout')
                .set('Cookie', authCookie)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify user is logged out
            const userResponse = await request(app)
                .get('/api/current-user')
                .set('Cookie', authCookie)
                .expect(401);

            expect(userResponse.body.error).toBeDefined();
        });
    });

    describe('Admin User Flow', () => {
        let newProductId;

        test('Admin Step 1: View all users', async () => {
            const response = await request(app)
                .get('/api/admin/users')
                .set('Cookie', adminCookie)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);

            // Should include our test user
            const testUser = response.body.find(u => u.username === 'e2e_test_user');
            expect(testUser).toBeDefined();
        });

        test('Admin Step 2: View user activities', async () => {
            const response = await request(app)
                .get('/api/admin/activity/e2e_test_user')
                .set('Cookie', adminCookie)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);

            // Should have various activities from the user flow
            const activityTypes = response.body.map(a => a.activityType);
            expect(activityTypes).toContain('login');
            expect(activityTypes).toContain('add_to_cart');
            expect(activityTypes).toContain('purchase');
        });

        test('Admin Step 3: Add new product', async () => {
            const productData = {
                name: 'E2E Test Diamond Ring',
                description: 'A beautiful diamond ring created during E2E testing',
                price: 1299.99,
                category: 'rings',
                customizable: true,
                stock: 25,
                image: 'test-diamond-ring.jpg'
            };

            const response = await request(app)
                .post('/api/admin/product')
                .set('Cookie', adminCookie)
                .send(productData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.product.name).toBe(productData.name);
            expect(response.body.product.id).toBeDefined();

            newProductId = response.body.product.id;
        });

        test('Admin Step 4: Update product', async () => {
            const updateData = {
                id: newProductId,
                name: 'E2E Test Premium Diamond Ring',
                price: 1499.99,
                stock: 30
            };

            const response = await request(app)
                .post('/api/admin/product')
                .set('Cookie', adminCookie)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.product.name).toBe('E2E Test Premium Diamond Ring');
            expect(response.body.product.price).toBe(1499.99);
            expect(response.body.product.stock).toBe(30);
        });

        test('Admin Step 5: Verify product appears in catalog', async () => {
            const response = await request(app)
                .get('/api/products')
                .set('Cookie', adminCookie)
                .expect(200);

            const newProduct = response.body.find(p => p.id === newProductId);
            expect(newProduct).toBeDefined();
            expect(newProduct.name).toBe('E2E Test Premium Diamond Ring');
        });

        test('Admin Step 6: Delete test product', async () => {
            const response = await request(app)
                .delete(`/api/admin/product/${newProductId}`)
                .set('Cookie', adminCookie)
                .expect(200);

            expect(response.body.success).toBe(true);

            // Verify product is removed from catalog
            const catalogResponse = await request(app)
                .get('/api/products')
                .set('Cookie', adminCookie);

            const deletedProduct = catalogResponse.body.find(p => p.id === newProductId);
            expect(deletedProduct).toBeUndefined();
        });
    });

    describe('Error Recovery Flows', () => {
        test('Recover from session timeout during checkout', async () => {
            // Login user again
            const loginResponse = await request(app)
                .post('/login')
                .send({
                    username: 'e2e_test_user',
                    password: 'testPassword123!'
                });

            const newAuthCookie = loginResponse.headers['set-cookie'][0].split(';')[0];

            // Add item to cart
            await request(app)
                .post('/api/cart/add')
                .set('Cookie', newAuthCookie)
                .send({ productId: testProductIds[0], quantity: 1 });

            // Simulate checkout with expired session
            const checkoutResponse = await request(app)
                .post('/api/checkout')
                .set('Cookie', 'userToken=expired_token')
                .send({
                    customerInfo: { fullName: 'Test' },
                    paymentInfo: { cardNumber: '4111111111111111' }
                })
                .expect(401);

            expect(checkoutResponse.body.error).toBeDefined();

            // User can re-login and cart should be preserved
            const cartResponse = await request(app)
                .get('/api/cart')
                .set('Cookie', newAuthCookie);

            expect(cartResponse.body.length).toBe(1);
        });

        test('Handle inventory changes during shopping', async () => {
            const loginResponse = await request(app)
                .post('/login')
                .send({
                    username: 'e2e_test_user',
                    password: 'testPassword123!'
                });

            const userCookie = loginResponse.headers['set-cookie'][0].split(';')[0];

            // User adds item to cart
            await request(app)
                .post('/api/cart/add')
                .set('Cookie', userCookie)
                .send({ productId: testProductIds[0], quantity: 1 });

            // Admin reduces stock to 0
            if (adminCookie) {
                await request(app)
                    .post('/api/admin/product')
                    .set('Cookie', adminCookie)
                    .send({ id: testProductIds[0], stock: 0 });
            }

            // User tries to add more of the same item
            const addResponse = await request(app)
                .post('/api/cart/add')
                .set('Cookie', userCookie)
                .send({ productId: testProductIds[0], quantity: 5 })
                .expect(400);

            expect(addResponse.body.success).toBe(false);
            expect(addResponse.body.error).toMatch(/(stock|inventory|available)/i);
        });

        test('Handle network interruption simulation', async () => {
            const loginResponse = await request(app)
                .post('/login')
                .send({
                    username: 'e2e_test_user',
                    password: 'testPassword123!'
                });

            const userCookie = loginResponse.headers['set-cookie'][0].split(';')[0];

            // Simulate partial data submission (missing required fields)
            const incompleteCheckout = await request(app)
                .post('/api/checkout')
                .set('Cookie', userCookie)
                .send({
                    customerInfo: { fullName: 'Test User' }
                    // Missing payment info and other required fields
                })
                .expect(400);

            expect(incompleteCheckout.body.success).toBe(false);
            expect(incompleteCheckout.body.error).toBeDefined();

            // Cart should remain unchanged after failed checkout
            const cartResponse = await request(app)
                .get('/api/cart')
                .set('Cookie', userCookie);

            expect(cartResponse.body.length).toBeGreaterThan(0);
        });
    });

    describe('Performance and Concurrent Operations', () => {
        test('Handle multiple users shopping simultaneously', async () => {
            // Create multiple test users
            const users = [];
            for (let i = 0; i < 3; i++) {
                const userData = {
                    username: `concurrent_user_${i}`,
                    password: 'testPass123',
                    email: `concurrent${i}@test.com`
                };

                const registerResponse = await request(app)
                    .post('/register')
                    .send(userData);

                const loginResponse = await request(app)
                    .post('/login')
                    .send({ username: userData.username, password: userData.password });

                if (loginResponse.body.success) {
                    users.push({
                        username: userData.username,
                        cookie: loginResponse.headers['set-cookie'][0].split(';')[0]
                    });
                }
            }

            // All users add same product to cart simultaneously
            const promises = users.map(user =>
                request(app)
                    .post('/api/cart/add')
                    .set('Cookie', user.cookie)
                    .send({ productId: testProductIds[0], quantity: 1 })
            );

            const responses = await Promise.all(promises);

            // All should succeed or handle gracefully
            responses.forEach(response => {
                expect([200, 409, 400]).toContain(response.status);
            });

            // Cleanup: logout all test users
            await Promise.all(users.map(user =>
                request(app)
                    .post('/logout')
                    .set('Cookie', user.cookie)
            ));
        });

        test('Handle rapid consecutive operations', async () => {
            const loginResponse = await request(app)
                .post('/login')
                .send({
                    username: 'e2e_test_user',
                    password: 'testPassword123!'
                });

            const userCookie = loginResponse.headers['set-cookie'][0].split(';')[0];

            // Rapid add/remove operations
            const operations = [];
            for (let i = 0; i < 10; i++) {
                operations.push(
                    request(app)
                        .post('/api/cart/add')
                        .set('Cookie', userCookie)
                        .send({ productId: testProductIds[0], quantity: 1 })
                );
            }

            const responses = await Promise.all(operations);

            // Most should succeed, some might fail due to concurrency
            const successCount = responses.filter(r => r.status === 200).length;
            expect(successCount).toBeGreaterThan(0);
        });
    });
});