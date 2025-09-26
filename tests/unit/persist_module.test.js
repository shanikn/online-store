const fs = require('fs').promises;
const path = require('path');

// Mock fs module for isolated testing
jest.mock('fs', () => ({
    promises: {
        mkdir: jest.fn(),
        readFile: jest.fn(),
        writeFile: jest.fn()
    }
}));

const persistModule = require('../../persist_module');

describe('Persist Module Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Clear require cache to ensure fresh module state
        delete require.cache[require.resolve('../../persist_module')];
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Data Directory Management', () => {
        test('should create data directories on initialization', async () => {
            fs.mkdir.mockResolvedValue();

            await persistModule.initialize();

            expect(fs.mkdir).toHaveBeenCalledWith('data', { recursive: true });
            expect(fs.mkdir).toHaveBeenCalledWith(path.join('data', 'user_data'), { recursive: true });
        });

        test('should handle directory creation errors gracefully', async () => {
            const error = new Error('Directory already exists');
            fs.mkdir.mockRejectedValue(error);

            // Should not throw error
            await expect(persistModule.initialize()).resolves.not.toThrow();
        });
    });

    describe('User Management', () => {
        test('should load users from file', async () => {
            const mockUsers = [
                { username: 'testuser', password: 'hashedpass', role: 'user' }
            ];
            fs.readFile.mockResolvedValue(JSON.stringify(mockUsers));

            const users = await persistModule.loadUsers();

            expect(users).toEqual(mockUsers);
            expect(fs.readFile).toHaveBeenCalledWith(path.join('data', 'users.json'), 'utf8');
        });

        test('should return empty array when users file does not exist', async () => {
            fs.readFile.mockRejectedValue(new Error('File not found'));

            const users = await persistModule.loadUsers();

            expect(users).toEqual([]);
        });

        test('should add new user correctly', async () => {
            const existingUsers = [{ username: 'existing', password: 'pass' }];
            const newUserData = { username: 'newuser', password: 'newpass' };

            fs.readFile.mockResolvedValue(JSON.stringify(existingUsers));
            fs.writeFile.mockResolvedValue();

            const newUser = await persistModule.addUser(newUserData);

            expect(newUser.username).toBe('newuser');
            expect(newUser.role).toBe('user');
            expect(newUser.createdAt).toBeDefined();
            expect(fs.writeFile).toHaveBeenCalled();
        });

        test('should save users to file correctly', async () => {
            const users = [{ username: 'test', password: 'pass' }];
            fs.writeFile.mockResolvedValue();

            await persistModule.saveUsers(users);

            expect(fs.writeFile).toHaveBeenCalledWith(
                path.join('data', 'users.json'),
                JSON.stringify(users, null, 2)
            );
        });
    });

    describe('Product Management', () => {
        test('should load products from file', async () => {
            const mockProducts = [
                { id: 1, name: 'Test Product', price: 99.99 }
            ];
            fs.readFile.mockResolvedValue(JSON.stringify(mockProducts));

            const products = await persistModule.loadProducts();

            expect(products).toEqual(mockProducts);
        });

        test('should add new product with generated ID', async () => {
            const existingProducts = [
                { id: 1, name: 'Product 1' },
                { id: 3, name: 'Product 3' }
            ];
            const newProductData = { name: 'New Product', price: 149.99 };

            fs.readFile.mockResolvedValue(JSON.stringify(existingProducts));
            fs.writeFile.mockResolvedValue();

            const newProduct = await persistModule.addProduct(newProductData);

            expect(newProduct.id).toBe(4); // Should be max(1,3) + 1
            expect(newProduct.name).toBe('New Product');
            expect(newProduct.createdAt).toBeDefined();
        });

        test('should remove product by ID', async () => {
            const products = [
                { id: 1, name: 'Product 1' },
                { id: 2, name: 'Product 2' },
                { id: 3, name: 'Product 3' }
            ];

            fs.readFile.mockResolvedValue(JSON.stringify(products));
            fs.writeFile.mockResolvedValue();

            const remainingProducts = await persistModule.removeProduct(2);

            expect(remainingProducts).toHaveLength(2);
            expect(remainingProducts.find(p => p.id === 2)).toBeUndefined();
        });
    });

    describe('Cart Management', () => {
        test('should save user cart to individual file', async () => {
            const cartItems = [{ productId: 1, quantity: 2 }];
            fs.writeFile.mockResolvedValue();

            await persistModule.saveUserCart('testuser', cartItems);

            expect(fs.writeFile).toHaveBeenCalledWith(
                path.join('data', 'user_data', 'testuser_cart.json'),
                JSON.stringify(cartItems, null, 2)
            );
        });

        test('should load user cart from individual file', async () => {
            const cartItems = [{ productId: 1, quantity: 2 }];
            fs.readFile.mockResolvedValue(JSON.stringify(cartItems));

            const cart = await persistModule.getUserCart('testuser');

            expect(cart).toEqual(cartItems);
            expect(fs.readFile).toHaveBeenCalledWith(
                path.join('data', 'user_data', 'testuser_cart.json'),
                'utf8'
            );
        });

        test('should return empty cart when file does not exist', async () => {
            fs.readFile.mockRejectedValue(new Error('File not found'));
            fs.writeFile.mockResolvedValue(); // For default value creation

            const cart = await persistModule.getUserCart('testuser');

            expect(cart).toEqual([]);
        });
    });

    describe('Activity Logging', () => {
        test('should log user activity correctly', async () => {
            const existingActivities = [
                { username: 'testuser', activityType: 'login', timestamp: '2023-01-01' }
            ];

            fs.readFile.mockResolvedValue(JSON.stringify(existingActivities));
            fs.writeFile.mockResolvedValue();

            const activity = await persistModule.logActivity('testuser', 'purchase', { amount: 99.99 });

            expect(activity.username).toBe('testuser');
            expect(activity.activityType).toBe('purchase');
            expect(activity.details.amount).toBe(99.99);
            expect(activity.timestamp).toBeDefined();
        });

        test('should get user activities correctly', async () => {
            const activities = [
                { username: 'testuser', activityType: 'login', timestamp: '2023-01-01' }
            ];

            fs.readFile.mockResolvedValue(JSON.stringify(activities));

            const userActivities = await persistModule.getUserActivities('testuser');

            expect(userActivities).toEqual(activities);
        });

        test('should combine activities from multiple users', async () => {
            const users = [
                { username: 'user1' },
                { username: 'user2' },
                { username: 'admin' }
            ];

            fs.readFile
                .mockResolvedValueOnce(JSON.stringify(users)) // loadUsers call
                .mockResolvedValueOnce(JSON.stringify([{ username: 'user1', activityType: 'login' }]))
                .mockResolvedValueOnce(JSON.stringify([{ username: 'user2', activityType: 'purchase' }]))
                .mockResolvedValueOnce(JSON.stringify([{ username: 'admin', activityType: 'admin_action' }]));

            const allActivities = await persistModule.getActivities();

            expect(allActivities).toHaveLength(3);
            expect(allActivities.find(a => a.username === 'user1')).toBeDefined();
            expect(allActivities.find(a => a.username === 'user2')).toBeDefined();
            expect(allActivities.find(a => a.username === 'admin')).toBeDefined();
        });

        test('should filter activities by username prefix', async () => {
            const users = [
                { username: 'admin' },
                { username: 'admin2' },
                { username: 'user1' }
            ];

            fs.readFile
                .mockResolvedValueOnce(JSON.stringify(users)) // loadUsers call
                .mockResolvedValueOnce(JSON.stringify([{ username: 'admin', activityType: 'admin_action' }]))
                .mockResolvedValueOnce(JSON.stringify([{ username: 'admin2', activityType: 'admin_action2' }]));

            const adminActivities = await persistModule.getActivities('admin');

            expect(adminActivities).toHaveLength(2);
            expect(adminActivities.every(a => a.username.startsWith('admin'))).toBe(true);
        });
    });

    describe('Purchase Management', () => {
        test('should save purchase with generated ID and timestamp', async () => {
            const purchaseData = {
                items: [{ productId: 1, quantity: 2 }],
                total: 199.98
            };

            fs.readFile.mockResolvedValue(JSON.stringify([])); // Empty purchases
            fs.writeFile.mockResolvedValue();

            const purchase = await persistModule.savePurchase('testuser', purchaseData);

            expect(purchase.id).toBeDefined();
            expect(purchase.timestamp).toBeDefined();
            expect(purchase.items).toEqual(purchaseData.items);
            expect(purchase.total).toBe(purchaseData.total);
        });

        test('should get user purchases correctly', async () => {
            const purchases = [
                { id: 1, username: 'testuser', total: 99.99 }
            ];

            fs.readFile.mockResolvedValue(JSON.stringify(purchases));

            const userPurchases = await persistModule.getUserPurchases('testuser');

            expect(userPurchases).toEqual(purchases);
        });
    });

    describe('Wishlist Management', () => {
        test('should save user wishlist correctly', async () => {
            const wishlist = [1, 2, 3];
            const existingWishlists = { otheruser: [4, 5] };

            fs.readFile.mockResolvedValue(JSON.stringify(existingWishlists));
            fs.writeFile.mockResolvedValue();

            await persistModule.saveUserWishlist('testuser', wishlist);

            expect(fs.writeFile).toHaveBeenCalledWith(
                path.join('data', 'wishlists.json'),
                JSON.stringify({ otheruser: [4, 5], testuser: [1, 2, 3] }, null, 2)
            );
        });

        test('should get user wishlist correctly', async () => {
            const wishlists = { testuser: [1, 2, 3] };
            fs.readFile.mockResolvedValue(JSON.stringify(wishlists));

            const userWishlist = await persistModule.getUserWishlist('testuser');

            expect(userWishlist).toEqual([1, 2, 3]);
        });

        test('should return empty array for non-existent wishlist', async () => {
            const wishlists = { otheruser: [1, 2] };
            fs.readFile.mockResolvedValue(JSON.stringify(wishlists));

            const userWishlist = await persistModule.getUserWishlist('testuser');

            expect(userWishlist).toEqual([]);
        });
    });

    describe('Contact Management', () => {
        test('should add contact correctly', async () => {
            const contactData = {
                name: 'John Doe',
                email: 'john@example.com',
                message: 'Hello world'
            };
            const existingContacts = [{ name: 'Jane', email: 'jane@example.com' }];

            fs.readFile.mockResolvedValue(JSON.stringify(existingContacts));
            fs.writeFile.mockResolvedValue();

            await persistModule.addContact(contactData);

            expect(fs.writeFile).toHaveBeenCalledWith(
                path.join('data', 'contacts.json'),
                JSON.stringify([...existingContacts, contactData], null, 2)
            );
        });
    });

    describe('Error Handling', () => {
        test('should handle file write errors', async () => {
            const error = new Error('Disk full');
            fs.writeFile.mockRejectedValue(error);

            await expect(persistModule.saveUsers([])).rejects.toThrow('Disk full');
        });

        test('should handle JSON parse errors', async () => {
            fs.readFile.mockResolvedValue('invalid json');

            const users = await persistModule.loadUsers();

            // Should return default value on parse error
            expect(users).toEqual([]);
        });
    });

    describe('Default Data Creation', () => {
        test('should create default admin when no users exist', async () => {
            fs.readFile.mockRejectedValue(new Error('File not found')); // No users file
            fs.writeFile.mockResolvedValue();

            // Mock require for products loading during initialize
            jest.doMock('../../data/products.json', () => [], { virtual: true });

            await persistModule.initialize();

            // Should create default admin
            expect(fs.writeFile).toHaveBeenCalledWith(
                expect.stringContaining('users.json'),
                expect.stringContaining('"username": "admin"')
            );
        });

        test('should not create default admin when users already exist', async () => {
            const existingUsers = [{ username: 'existinguser' }];
            fs.readFile.mockResolvedValue(JSON.stringify(existingUsers));
            fs.writeFile.mockResolvedValue();

            // Mock the require calls for loadData during initialize
            jest.doMock('../../data/products.json', () => [{ id: 1 }], { virtual: true });

            await persistModule.initialize();

            // Should not write new users file
            const writeFileCalls = fs.writeFile.mock.calls;
            const userFileWrites = writeFileCalls.filter(call =>
                call[0] && call[0].includes('users.json')
            );
            expect(userFileWrites).toHaveLength(0);
        });
    });
});