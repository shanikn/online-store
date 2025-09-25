// require statements
const express= require('express');
const cookieParser= require('cookie-parser');
const path= require('path');
const persist= require('./persist_module');
// const cors = require('cors'); // For React conversion later


function getCurrentUser(req) {
    return req.cookies.userToken || null;
}


// screen modules imports
const loginServer = require('./screens/login-server');
const storeServer = require('./screens/store-server');
const adminServer = require('./screens/admin-server');
const cartServer = require('./screens/cart-server');
const checkoutServer = require('./screens/checkout-server');
const registerServer = require('./screens/register-server');
// const myItemsServer = require('./screens/my-items-server'); // Not currently used


// app startup
const app= express();

// middleware
// app.use(cors({
//     origin: 'http://localhost:3000',
//     credentials: true
// })); // For React conversion later
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// helper functions

// authentication
function requireAuth(req, res, next){
    if(getCurrentUser(req)) {
        // the user is logged in=> continue
        next();
    }
    else{
        // the user isn't logged in=> redirect to login screen
        res.redirect('/login.html');
    }
}

// API authentication - for AJAX requests, return JSON instead of redirect
function requireAuthAPI(req, res, next){
    if(getCurrentUser(req)) {
        // the user is logged in=> continue
        next();
    }
    else{
        // the user isn't logged in=> return 401 for API calls
        res.status(401).json({ error: 'Authentication required', redirect: '/login.html' });
    }
}

// Note: getCurrentUser is already defined above, removing duplicate


// more helper functions- rate limiting functions
const requestCounts= {};
const RATE_LIMIT= 100; //max requests
const TIME_WINDOW= 60000;

function rateLimiter(req, res, next){
    const ip= req.ip;
    const now= Date.now();

    //init/clear old entries
    if(!requestCounts[ip]){
        requestCounts[ip]= [];
    }

    // remove requests which are older than TIME_WINDOW
    requestCounts[ip]= requestCounts[ip].filter(time=> now-time<TIME_WINDOW);

    // check rate limit (429=too many)
    if(requestCounts[ip].length>=RATE_LIMIT){
        return res.status(429).json({ error: 'Too many requests' });
    }

    // add the current request & continue
    requestCounts[ip].push(now);
    return next();
}

// more middleware
app.use(rateLimiter);


// routes

// basic routes (later i'll move some of them to modules)
app.get('/', (req, res)=> {
    // (home page is /store.html - users can browse without login)
    res.redirect('/store.html');
});


// auth routes (login, logout, register)
app.post('/login', loginServer.handleLogin);


app.post('/logout', loginServer.handleLogout);


app.post('/register', registerServer.handleRegister);



// public pages (no auth required)
app.get('/store.html', (req, res)=> {
    res.sendFile(path.join(__dirname, 'public', 'store.html'));
});


app.get('/cart.html', requireAuth, (req, res)=> {
    res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});


app.get('/admin.html', requireAuth, (req, res)=> {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});


app.get('/profile.html', requireAuth, (req, res)=> {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/checkout.html', requireAuth, (req, res)=> {
    res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

app.get('/my-items.html', requireAuth, (req, res)=> {
    res.sendFile(path.join(__dirname, 'public', 'my-items.html'));
});




// API routes (AJAX)
// Public API - no auth required for browsing products
app.get('/api/products', storeServer.getProducts);

// add item to cart
// Cart endpoints
app.post('/api/cart', requireAuthAPI, cartServer.addToCart);
app.get('/api/cart', requireAuthAPI, cartServer.getCart);

// Remove item from cart - multiple endpoints for compatibility
app.delete('/api/cart/:productId', requireAuthAPI, cartServer.removeFromCart);
app.post('/api/cart/remove', requireAuthAPI, (req, res) => cartServer.removeFromCart(req, res));


// update cart quantity (also for when clearing cart after purchase- resetting quanitity to 0)
app.put('/api/cart/update', requireAuthAPI, cartServer.updateCart);


// clear whole cart (like after purchase)
app.delete('/api/cart/clear', requireAuthAPI, cartServer.clearCart);


// update cart item customization
app.put('/api/cart/update-customization', requireAuthAPI, cartServer.updateCustomization);


// search a product in store - public API
app.get('/api/products/search', storeServer.searchProducts);


// Admin activity routes
app.get('/api/admin/activity', requireAuthAPI, adminServer.getActivities);
app.get('/api/admin/activities', requireAuthAPI, adminServer.getActivities);
app.get('/api/admin/activities/filter', requireAuthAPI, adminServer.getActivities);


app.post('/api/admin/products', requireAuthAPI, adminServer.addProduct);


app.delete('/api/admin/products/:id', requireAuthAPI, adminServer.removeProduct);



// Checkout endpoint - process an order
app.post('/api/checkout', requireAuthAPI, checkoutServer.processCheckout);

// Alternative checkout endpoint for compatibility
app.post('/api/orders', requireAuthAPI, checkoutServer.processCheckout);



app.get('/api/purchases', requireAuthAPI, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        const purchases = await persist.getPurchases(username);
        res.json(purchases);
    }
    catch(error){
        console.error('Error loading purchases:', error);
        res.status(500).json({ error: 'Failed to load purchases' });
    }
});


// get sales data for admin dashboard
app.get('/api/admin/sales', requireAuthAPI, async(req, res)=> {
    try{
        const allPurchases= await persist.loadData('purchases.json', {});

        let totalSales = 0;
        let totalOrders = 0;

        // calculate total sales across all users
        Object.values(allPurchases).forEach(userPurchases => {
            if(Array.isArray(userPurchases)){
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
    }
    catch(error){
        console.error('Error loading sales data:', error);
        res.status(500).json({ error: 'Failed to load sales data' });
    }
});


// get current user info for profile page
app.get('/api/users/current', requireAuthAPI, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        const users= persist.getUsers();
        const user= users.find(u=> u.username === username);

        if(user){
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    }
    catch(error){
        console.error('Error loading user info:', error);
        res.status(500).json({ error: 'Failed to load user info' });
    }
});


// extra pages

app.post('/api/contact', requireAuthAPI, async(req, res)=> {
    try{
        const { name, email, message }= req.body;

        await persist.addContact({
            id: Date.now(),
            name,
            email,
            message,
            timestamp: new Date().toISOString(),
            from: getCurrentUser(req)
        });

        res.json({ success: true, message: 'Message sent' });
    }
    catch(error){
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

app.put('/api/profile', requireAuthAPI, async(req, res)=> {
    try {
        const oldUsername = getCurrentUser(req);
        const { newUsername, email } = req.body;

        // migrate user data
        const cart = await persist.loadCart(oldUsername);
        const wishlist = await persist.loadData('wishlists.json', {});

        await persist.saveCart(newUsername, cart);
        if (wishlist[oldUsername]) {
            wishlist[newUsername] = wishlist[oldUsername];
            delete wishlist[oldUsername];
            await persist.saveData('wishlists.json', wishlist);
        }

        // update users and set new cookie
        const users = await persist.loadUsers();
        const userIndex = users.findIndex(u => u.username === oldUsername);
        users[userIndex] = {...users[userIndex], username: newUsername, email};
        await persist.saveUsers(users);

        res.cookie('userToken', newUsername, {maxAge: 12*24*60*60*1000});
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

app.get('/api/wishlist', requireAuthAPI, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        const userWishlistIds = await persist.getUserWishlist(username);
        const products = persist.getProducts();
        const wishlistItems = products.filter(product => userWishlistIds.includes(product.id));

        res.json(wishlistItems);
    }
    catch(error){
        console.error('Error loading wishlist:', error);
        res.status(500).json({ error: 'Failed to load wishlist' });
    }
});


app.post('/api/wishlist', requireAuthAPI, async(req, res)=>{
    try{
        const username= getCurrentUser(req);
        const { productId }= req.body;

        const wishlist = await persist.getUserWishlist(username);
        const numProductId = typeof productId === 'string' ? parseInt(productId) : productId;

        if(!wishlist.includes(numProductId)){
            wishlist.push(numProductId);
            await persist.saveUserWishlist(username, wishlist);
        }

        res.json({ success: true });
    }
    catch(error){
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
});

app.delete('/api/wishlist', requireAuthAPI, async(req, res)=>{
    try{
        const username = getCurrentUser(req);
        const productId = req.body.productId;

        if (!productId) {
            return res.status(400).json({ success: false, error: 'Product ID is required' });
        }

        // Get current wishlist
        const userWishlist = await persist.getUserWishlist(username);

        // Convert to number for consistent comparison
        const numProductId = typeof productId === 'string' ? parseInt(productId) : productId;

        // Remove the product from wishlist
        const updatedWishlist = userWishlist.filter(id => {
            const numId = typeof id === 'string' ? parseInt(id) : id;
            return numId !== numProductId;
        });

        // Save the updated wishlist
        await persist.saveUserWishlist(username, updatedWishlist);

        return res.json({ success: true });
    }
    catch(error){
        console.error('Error removing from wishlist:', error);
        return res.status(500).json({ success: false, error: 'Failed to remove from wishlist' });
    }
});

// Legacy endpoint for backward compatibility
app.delete('/api/wishlist/remove', requireAuthAPI, async(req, res)=>{
    try {
        const username = getCurrentUser(req);
        const productId = req.body.productId;

        if (!productId) {
            return res.status(400).json({ success: false, error: 'Product ID is required' });
        }

        // Get current wishlist
        const userWishlist = await persist.getUserWishlist(username);

        // Convert to number for consistent comparison
        const numProductId = typeof productId === 'string' ? parseInt(productId) : productId;

        // Remove the product from wishlist
        const updatedWishlist = userWishlist.filter(id => {
            const numId = typeof id === 'string' ? parseInt(id) : id;
            return numId !== numProductId;
        });

        // Save the updated wishlist
        await persist.saveUserWishlist(username, updatedWishlist);

        return res.json({ success: true });
    }
    catch(error) {
        console.error('Error removing from wishlist:', error);
        return res.status(500).json({ success: false, error: 'Failed to remove from wishlist' });
    }
});


// Migration function to add createdAt to existing users
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

// start server
app.listen(5000, async ()=> {
    console.log('Express App running at http://127.0.0.1:5000/');

    // Initialize persist module
    await persist.initialize();

    // Run migration on startup
    await migrateUserData();
});