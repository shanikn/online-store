const fs = require('fs').promises;
const path = require('path');

class TestDataManager {
    constructor() {
        this.testDataPath = path.join(__dirname, '..', '..', 'data');
        this.userDataPath = path.join(this.testDataPath, 'user_data');
        this.backupPath = path.join(__dirname, 'backups');
        this.testUsers = [];
        this.originalData = {};
    }

    async initialize() {
        // Create backup directory if it doesn't exist
        await fs.mkdir(this.backupPath, { recursive: true });

        // Backup original data files before testing
        await this.backupOriginalData();
    }

    async backupOriginalData() {
        const filesToBackup = [
            'users.json',
            'products.json',
            'wishlists.json',
            'contacts.json'
        ];

        for (const file of filesToBackup) {
            try {
                const originalPath = path.join(this.testDataPath, file);
                const backupPath = path.join(this.backupPath, `original_${file}`);

                const data = await fs.readFile(originalPath, 'utf8');
                await fs.writeFile(backupPath, data);
                this.originalData[file] = JSON.parse(data);
            } catch (error) {
                // File might not exist, create empty backup
                this.originalData[file.replace('.json', '')] = file === 'wishlists.json' ? {} : [];
            }
        }
    }

    async restoreOriginalData() {
        for (const [filename, data] of Object.entries(this.originalData)) {
            const filepath = path.join(this.testDataPath, filename.endsWith('.json') ? filename : `${filename}.json`);
            await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        }
    }

    async createTestProducts() {
        const testProducts = [
            {
                id: 9001,
                name: 'Test Gold Earrings',
                description: '18k gold test earrings for automated testing',
                price: 199.99,
                category: 'earrings',
                customizable: false,
                stock: 100,
                image: 'test-gold-earrings.jpg'
            },
            {
                id: 9002,
                name: 'Test Silver Necklace',
                description: 'Sterling silver test necklace with pendant',
                price: 149.99,
                category: 'necklaces',
                customizable: true,
                stock: 50,
                image: 'test-silver-necklace.jpg'
            },
            {
                id: 9003,
                name: 'Test Diamond Ring',
                description: '1ct diamond test ring in white gold setting',
                price: 2999.99,
                category: 'rings',
                customizable: true,
                stock: 10,
                image: 'test-diamond-ring.jpg'
            },
            {
                id: 9004,
                name: 'Test Platinum Watch',
                description: 'Luxury platinum test watch with automatic movement',
                price: 4999.99,
                category: 'watches',
                customizable: false,
                stock: 5,
                image: 'test-platinum-watch.jpg'
            },
            {
                id: 9005,
                name: 'Test Pearl Bracelet',
                description: 'Cultured pearl test bracelet with gold clasp',
                price: 299.99,
                category: 'bracelets',
                customizable: false,
                stock: 25,
                image: 'test-pearl-bracelet.jpg'
            }
        ];

        // Load existing products and add test products
        let products = [];
        try {
            const data = await fs.readFile(path.join(this.testDataPath, 'products.json'), 'utf8');
            products = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, start with empty array
        }

        // Remove any existing test products first
        products = products.filter(p => p.id < 9000);

        // Add new test products
        products.push(...testProducts);

        await fs.writeFile(
            path.join(this.testDataPath, 'products.json'),
            JSON.stringify(products, null, 2)
        );

        return testProducts;
    }

    async createTestUser(username, options = {}) {
        const defaultUser = {
            username,
            password: options.password || 'testPass123',
            email: options.email || `${username}@test.com`,
            role: options.role || 'user',
            createdAt: new Date().toISOString(),
            ...options
        };

        // Load existing users
        let users = [];
        try {
            const data = await fs.readFile(path.join(this.testDataPath, 'users.json'), 'utf8');
            users = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, start with empty array
        }

        // Check if user already exists
        const existingUserIndex = users.findIndex(u => u.username === username);
        if (existingUserIndex >= 0) {
            // Update existing user
            users[existingUserIndex] = { ...users[existingUserIndex], ...defaultUser };
        } else {
            // Add new user
            users.push(defaultUser);
        }

        await fs.writeFile(
            path.join(this.testDataPath, 'users.json'),
            JSON.stringify(users, null, 2)
        );

        // Create user data files
        await this.createUserDataFiles(username);

        this.testUsers.push(username);
        return defaultUser;
    }

    async createUserDataFiles(username) {
        const userDataFiles = [
            { filename: `${username}_cart.json`, data: [] },
            { filename: `${username}_activity.json`, data: [] },
            { filename: `${username}_purchases.json`, data: [] },
            { filename: `${username}_wishlist.json`, data: [] }
        ];

        for (const file of userDataFiles) {
            const filepath = path.join(this.userDataPath, file.filename);
            await fs.writeFile(filepath, JSON.stringify(file.data, null, 2));
        }
    }

    async addToUserCart(username, items) {
        const cartPath = path.join(this.userDataPath, `${username}_cart.json`);
        let cart = [];

        try {
            const data = await fs.readFile(cartPath, 'utf8');
            cart = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, start with empty cart
        }

        // Add items to cart
        for (const item of items) {
            const existingItem = cart.find(c => c.productId === item.productId);
            if (existingItem) {
                existingItem.quantity += item.quantity || 1;
            } else {
                cart.push({
                    productId: item.productId,
                    quantity: item.quantity || 1,
                    addedAt: new Date().toISOString()
                });
            }
        }

        await fs.writeFile(cartPath, JSON.stringify(cart, null, 2));
        return cart;
    }

    async addToUserWishlist(username, productIds) {
        const wishlistPath = path.join(this.testDataPath, 'wishlists.json');
        let wishlists = {};

        try {
            const data = await fs.readFile(wishlistPath, 'utf8');
            wishlists = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, start with empty object
        }

        if (!wishlists[username]) {
            wishlists[username] = [];
        }

        // Add product IDs to wishlist (avoid duplicates)
        for (const productId of productIds) {
            if (!wishlists[username].includes(productId)) {
                wishlists[username].push(productId);
            }
        }

        await fs.writeFile(wishlistPath, JSON.stringify(wishlists, null, 2));
        return wishlists[username];
    }

    async addUserActivity(username, activities) {
        const activityPath = path.join(this.userDataPath, `${username}_activity.json`);
        let userActivities = [];

        try {
            const data = await fs.readFile(activityPath, 'utf8');
            userActivities = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, start with empty array
        }

        // Add activities
        for (const activity of activities) {
            userActivities.push({
                timestamp: new Date().toISOString(),
                username,
                activityType: activity.type,
                details: activity.details || {},
                ...activity
            });
        }

        await fs.writeFile(activityPath, JSON.stringify(userActivities, null, 2));
        return userActivities;
    }

    async addUserPurchases(username, purchases) {
        const purchasePath = path.join(this.userDataPath, `${username}_purchases.json`);
        let userPurchases = [];

        try {
            const data = await fs.readFile(purchasePath, 'utf8');
            userPurchases = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, start with empty array
        }

        // Add purchases
        for (const purchase of purchases) {
            userPurchases.push({
                id: Date.now() + Math.random(),
                timestamp: new Date().toISOString(),
                items: purchase.items,
                total: purchase.total,
                customerInfo: purchase.customerInfo,
                ...purchase
            });
        }

        await fs.writeFile(purchasePath, JSON.stringify(userPurchases, null, 2));
        return userPurchases;
    }

    async createTestScenarios() {
        // Create test products
        const testProducts = await this.createTestProducts();

        // Create test users with different profiles
        const regularUser = await this.createTestUser('test_regular_user', {
            email: 'regular@test.com'
        });

        const premiumUser = await this.createTestUser('test_premium_user', {
            email: 'premium@test.com',
            role: 'premium'
        });

        const testAdmin = await this.createTestUser('test_admin_user', {
            email: 'testadmin@test.com',
            role: 'admin'
        });

        // Set up scenario data

        // Regular user with some cart items and wishlist
        await this.addToUserCart('test_regular_user', [
            { productId: testProducts[0].id, quantity: 2 },
            { productId: testProducts[1].id, quantity: 1 }
        ]);

        await this.addToUserWishlist('test_regular_user', [
            testProducts[2].id,
            testProducts[3].id
        ]);

        await this.addUserActivity('test_regular_user', [
            { type: 'login', details: { ip: '127.0.0.1' } },
            { type: 'view_product', details: { productId: testProducts[0].id } },
            { type: 'add_to_cart', details: { productId: testProducts[0].id, quantity: 2 } }
        ]);

        // Premium user with purchase history
        await this.addUserPurchases('test_premium_user', [
            {
                items: [
                    { productId: testProducts[2].id, quantity: 1, price: testProducts[2].price }
                ],
                total: testProducts[2].price,
                customerInfo: {
                    fullName: 'Premium Test User',
                    email: 'premium@test.com'
                }
            }
        ]);

        await this.addUserActivity('test_premium_user', [
            { type: 'login', details: { ip: '127.0.0.1' } },
            { type: 'purchase', details: { orderId: 'TEST_ORDER_001', total: testProducts[2].price } }
        ]);

        return {
            products: testProducts,
            users: { regularUser, premiumUser, testAdmin }
        };
    }

    async cleanup() {
        // Remove test users from users.json
        try {
            const usersPath = path.join(this.testDataPath, 'users.json');
            const data = await fs.readFile(usersPath, 'utf8');
            let users = JSON.parse(data);

            // Remove test users
            users = users.filter(u => !this.testUsers.includes(u.username) && !u.username.startsWith('test_'));

            await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
        } catch (error) {
            console.log('Warning: Could not cleanup test users:', error.message);
        }

        // Remove test user data files
        for (const username of this.testUsers) {
            const userFiles = [
                `${username}_cart.json`,
                `${username}_activity.json`,
                `${username}_purchases.json`,
                `${username}_wishlist.json`
            ];

            for (const file of userFiles) {
                try {
                    await fs.unlink(path.join(this.userDataPath, file));
                } catch (error) {
                    // File might not exist, ignore
                }
            }
        }

        // Remove test products
        try {
            const productsPath = path.join(this.testDataPath, 'products.json');
            const data = await fs.readFile(productsPath, 'utf8');
            let products = JSON.parse(data);

            // Remove test products (ID >= 9000)
            products = products.filter(p => p.id < 9000);

            await fs.writeFile(productsPath, JSON.stringify(products, null, 2));
        } catch (error) {
            console.log('Warning: Could not cleanup test products:', error.message);
        }

        // Clear test wishlists
        try {
            const wishlistsPath = path.join(this.testDataPath, 'wishlists.json');
            let wishlists = {};

            try {
                const data = await fs.readFile(wishlistsPath, 'utf8');
                wishlists = JSON.parse(data);
            } catch (error) {
                // File doesn't exist, nothing to clean
                return;
            }

            // Remove test user wishlists
            for (const username of this.testUsers) {
                delete wishlists[username];
            }

            await fs.writeFile(wishlistsPath, JSON.stringify(wishlists, null, 2));
        } catch (error) {
            console.log('Warning: Could not cleanup test wishlists:', error.message);
        }

        // Reset arrays
        this.testUsers = [];
    }

    // Helper methods for specific test scenarios
    async createEmptyUserScenario(username) {
        const user = await this.createTestUser(username);
        return user;
    }

    async createUserWithCartScenario(username, productIds) {
        const user = await this.createTestUser(username);
        const cartItems = productIds.map(id => ({ productId: id, quantity: 1 }));
        await this.addToUserCart(username, cartItems);
        return user;
    }

    async createUserWithPurchaseHistoryScenario(username, purchaseCount = 3) {
        const user = await this.createTestUser(username);
        const testProducts = await this.createTestProducts();

        const purchases = [];
        for (let i = 0; i < purchaseCount; i++) {
            const product = testProducts[i % testProducts.length];
            purchases.push({
                items: [{ productId: product.id, quantity: 1, price: product.price }],
                total: product.price,
                customerInfo: {
                    fullName: `${username} User`,
                    email: `${username}@test.com`
                }
            });
        }

        await this.addUserPurchases(username, purchases);
        return user;
    }
}

// Singleton instance
const testDataManager = new TestDataManager();

module.exports = {
    TestDataManager,
    testDataManager
};