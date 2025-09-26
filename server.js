// require statements
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const persist = require('./persist_module');

function getCurrentUser(req) {
    return req.cookies.userToken || null;
}

// screen modules imports
const loginServer = require('./screens/login-server');
const registerServer = require('./screens/register-server');
const storeServer = require('./screens/store-server');
const cartServer = require('./screens/cart-server');
const checkoutServer = require('./screens/checkout-server');
const adminServer = require('./screens/admin-server');
const myItemsServer = require('./screens/my-items-server');
const profileServer = require('./screens/profile-server');
const contactServer = require('./screens/contact-server');
const wishlistServer = require('./screens/wishlist-server');

// app startup
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// authentication middleware
function requireAuth(req, res, next) {
    if (getCurrentUser(req)) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

// API authentication - for AJAX requests
function requireAuthAPI(req, res, next) {
    if (getCurrentUser(req)) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required', redirect: '/login.html' });
    }
}

// rate limiting
const requestCounts = {};
const RATE_LIMIT = 100;
const TIME_WINDOW = 60000;

function rateLimiter(req, res, next) {
    const ip = req.ip;
    const now = Date.now();

    if (!requestCounts[ip]) {
        requestCounts[ip] = [];
    }

    requestCounts[ip] = requestCounts[ip].filter(time => now - time < TIME_WINDOW);

    if (requestCounts[ip].length >= RATE_LIMIT) {
        return res.status(429).json({ error: 'Too many requests' });
    }

    requestCounts[ip].push(now);
    return next();
}

app.use(rateLimiter);

// ========== ROUTES ==========

// Home redirect
app.get('/', (req, res) => {
    try {
        res.redirect('/store.html');
    } catch (error) {
        console.error('Error redirecting to store:', error);
        res.status(500).send('Failed to load page');
    }
});

// Auth routes
app.post('/login', loginServer.handleLogin);
app.post('/logout', loginServer.handleLogout);
app.post('/register', registerServer.handleRegister);

// HTML page routes
app.get('/store.html', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'public', 'store.html'));
    } catch (error) {
        console.error('Error serving store.html:', error);
        res.status(500).send('Failed to load page');
    }
});

app.get('/cart.html', requireAuth, (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'public', 'cart.html'));
    } catch (error) {
        console.error('Error serving cart.html:', error);
        res.status(500).send('Failed to load page');
    }
});

app.get('/admin.html', requireAuth, (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    } catch (error) {
        console.error('Error serving admin.html:', error);
        res.status(500).send('Failed to load page');
    }
});

app.get('/profile.html', requireAuth, (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'public', 'profile.html'));
    } catch (error) {
        console.error('Error serving profile.html:', error);
        res.status(500).send('Failed to load page');
    }
});

app.get('/checkout.html', requireAuth, (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
    } catch (error) {
        console.error('Error serving checkout.html:', error);
        res.status(500).send('Failed to load page');
    }
});

app.get('/my-items.html', requireAuth, (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'public', 'my-items.html'));
    } catch (error) {
        console.error('Error serving my-items.html:', error);
        res.status(500).send('Failed to load page');
    }
});

// ========== API ROUTES ==========

// Store/Products API (public)
app.get('/api/products', storeServer.getProducts);
app.get('/api/products/search', storeServer.searchProducts);

// Cart API
app.post('/api/cart', requireAuthAPI, cartServer.addToCart);
app.get('/api/cart', requireAuthAPI, cartServer.getCart);
app.delete('/api/cart/:productId', requireAuthAPI, cartServer.removeFromCart);
app.post('/api/cart/remove', requireAuthAPI, (req, res) => cartServer.removeFromCart(req, res));
app.put('/api/cart/update', requireAuthAPI, cartServer.updateCart);
app.delete('/api/cart/clear', requireAuthAPI, cartServer.clearCart);
app.put('/api/cart/update-customization', requireAuthAPI, cartServer.updateCustomization);

// Admin API
app.get('/api/admin/users', requireAuthAPI, adminServer.getUsers);
app.get('/api/admin/activity', requireAuthAPI, adminServer.getActivities);
app.get('/api/admin/activities', requireAuthAPI, adminServer.getActivities);
app.get('/api/admin/activities/filter', requireAuthAPI, adminServer.getActivities);
app.post('/api/admin/products', requireAuthAPI, adminServer.addProduct);
app.post('/api/admin/product', requireAuthAPI, adminServer.addProduct);
app.delete('/api/admin/products/:id', requireAuthAPI, adminServer.removeProduct);
app.delete('/api/admin/product/:id', requireAuthAPI, adminServer.removeProduct);
app.get('/api/admin/sales', requireAuthAPI, async (req, res) => {
    try {
        const allPurchases = await persist.loadData('purchases.json', {});

        let totalSales = 0;
        let totalOrders = 0;

        Object.values(allPurchases).forEach(userPurchases => {
            if (Array.isArray(userPurchases)) {
                userPurchases.forEach(purchase => {
                    totalSales += purchase.total || 0;
                    totalOrders++;
                });
            }
        });

        res.json({
            totalSales: totalSales.toFixed(2),
            totalOrders,
            currency: '₪'
        });
    } catch (error) {
        console.error('Error loading sales data:', error);
        res.status(500).json({ error: 'Failed to load sales data' });
    }
});

// Checkout API
app.post('/api/checkout', requireAuthAPI, checkoutServer.processCheckout);
app.post('/api/orders', requireAuthAPI, checkoutServer.processCheckout);

// My Items (Purchases) API
app.get('/api/purchases', requireAuthAPI, myItemsServer.getPurchases);

// Profile API
app.get('/api/users/current', requireAuthAPI, profileServer.getCurrentUserInfo);
app.put('/api/profile', requireAuthAPI, profileServer.updateProfile);

// Contact API
app.post('/api/contact', requireAuthAPI, contactServer.submitContact);

// Wishlist API
app.get('/api/wishlist', requireAuthAPI, wishlistServer.getWishlist);
app.post('/api/wishlist', requireAuthAPI, wishlistServer.addToWishlist);
app.delete('/api/wishlist', requireAuthAPI, wishlistServer.removeFromWishlist);
app.delete('/api/wishlist/remove', requireAuthAPI, wishlistServer.removeFromWishlist);

// Migration function
async function migrateUserData() {
    try {
        const users = await persist.loadUsers();
        let hasChanges = false;

        const updatedUsers = users.map(user => {
            if (!user.createdAt) {
                hasChanges = true;
                return {
                    ...user,
                    role: user.role || 'user',
                    email: user.email || '',
                    createdAt: new Date().toISOString()
                };
            }
            return user;
        });

        if (hasChanges) {
            await persist.saveUsers(updatedUsers);
            console.log('✅ Migrated user data - added missing createdAt fields');
        }
    } catch (error) {
        console.error('❌ Error migrating user data:', error);
    }
}

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error'
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
app.listen(5000, async () => {
    console.log('Express App running at http://127.0.0.1:5000/');
    await persist.initialize();
    await migrateUserData();
});
