// require statements
const express= require('express');
const cookieParser= require('cookie-parser');
const path= require('path');
const persist= require('./persist_module');
// const cors = require('cors'); // For React conversion later 

// screen modules imports 
// TODO:(uncomment after implementing them)
const loginServer = require('./screens/login-server');
const storeServer = require('./screens/store-server');
const adminServer = require('./screens/admin-server');
const cartServer = require('./screens/cart-server');
const checkoutServer = require('./screens/checkout-server');
const registerServer = require('./screens/register-server');


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

// get user from cookies
function getCurrentUser(req){
    return req.cookies.userToken || null;
}


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
    next();
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
app.post('/login', async(req, res)=> {
    // getting users data and validating it
    try{
        const { username, password, remember }= req.body;
        
        // load users & find specific user
        const users= await persist.loadUsers();
        const user= users.find(u=> u.username === username && u.password === password);

        if(user){
            // set cookie with experation time (12 days or 30 minutes)
            const maxAge= remember ? (12*24*60*60*1000) : (30*60*1000);
            res.cookie('userToken', username, {maxAge: maxAge});

            // log activity
            await persist.logActivity(username, 'login');

            // on login success (valid input): send success response & redirect to store screen
            res.json({ success: true, redirect: '/store.html' });
        }
        else{
            // on login error (invalid input): send error response & display error message
            res.json({ success: false, message: 'Invalid credentials' });
        }
    }
    catch(error){
        // error handling
        console.error('Login error: ', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


app.post('/logout', async(req, res)=> {
    try{
        const username= getCurrentUser(req);

        // clear the cookie on logout (multiple ways to ensure it's cleared)
        res.clearCookie('userToken');
        res.clearCookie('userToken', { path: '/' });
        res.clearCookie('userToken', { path: '/', domain: 'localhost' });

        // and log the logout itself in activity.json
        if(username){
            await persist.logActivity(username, 'logout');
        }

        res.json({ success: true, redirect: '/store.html' });
    }
    catch(error){
        console.error('Logout error: ', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


app.post('/register', async(req, res)=> {
    try{
        const { username, password, remember }= req.body;

        // check if the username already exists
        const users= await persist.loadUsers();
        if(users.find(u=> u.username === username)){
            return res.json({ success: false, message: 'Username already exists' });
        }

        // add a new user
        await persist.addUser({ username, password });


        // auto login the newly added user (instead of redirecting him to login screen)
        const maxAge= remember ? (12*24*60*60*1000) : (30*60*1000);
        res.cookie('userToken', username, { maxAge: maxAge });

        //log the activity
        await persist.logActivity(username, 'register');

        // redirect right to the store screen
        res.json({ success: true, redirect: '/store.html' });
    }
    catch(error){
        console.error('Register error: ', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});



// public pages (no auth required)
app.get('/store.html', (req, res)=> {
    res.sendFile(path.join(__dirname, 'public', 'store.html'));
});

// protected html pages (cart, admin, profile)
app.get('/products.html', (req, res)=> {
    res.sendFile(path.join(__dirname, 'public', 'store.html')); // products and store are the same page
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




// API routes (AJAX)
// Public API - no auth required for browsing products
app.get('/api/products', async(req, res)=> {
    try{
        const products= await persist.loadProducts();
        res.json(products);
    }
    catch(error){
        console.error('Error loading products: ', error);
        res.status(500).json({ error: 'Failed to load products' });
    }
});


app.post('/api/cart/add', requireAuthAPI, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        const { productId, customization }= req.body;

        console.log(`[DEBUG] Adding to cart - Username: ${username}, ProductId: ${productId} (type: ${typeof productId}), Customization:`, customization);

        // get the user cart
        const cart= await persist.loadCart(username);
        console.log(`[DEBUG] Current cart before add:`, cart);

        // For customizable items, always add as new item since each customization is unique
        if(customization && Object.keys(customization).length > 0) {
            cart.push({
                productId,
                quantity: 1,
                customization,
                addedAt: new Date().toISOString()
            });
            console.log(`[DEBUG] Added new customized item to cart`);
        } else {
            // add the new item to cart (if item already exists, add 1 to quantity)
            const existingItem= cart.find(item=> item.productId === productId && !item.customization);
            if(existingItem){
                existingItem.quantity+=1;
                console.log(`[DEBUG] Updated existing item quantity to ${existingItem.quantity}`);
            }
            else{
                cart.push({ productId, quantity: 1, addedAt: new Date().toISOString() });
                console.log(`[DEBUG] Added new item to cart`);
            }
        }

        // save the cart
        await persist.saveCart(username, cart);
        console.log(`[DEBUG] Cart after save:`, cart);

        // log activity
        await persist.logActivity(username, 'add-to-cart', { productId, customization });
        res.json({ success: true });
    }
    catch(error){
        console.error('Error adding to cart: ', error);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

// get user cart
app.get('/api/cart', requireAuthAPI, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        const cart= await persist.loadCart(username);

        // Enrich cart items with product details
        const products = await persist.loadProducts();
        const enrichedCart = cart.map(cartItem => {
            const product = products.find(p => p.id === cartItem.productId);
            if (!product) {
                console.warn(`Product with ID ${cartItem.productId} not found`);
                return null;
            }
            return {
                ...cartItem,
                name: product.name,
                description: product.description,
                price: product.price,
                image: product.image,
                customizable: product.customizable
            };
        }).filter(item => item !== null); // Remove null items (products not found)

        console.log(`[DEBUG] Loading enriched cart for ${username}:`, enrichedCart);
        res.json(enrichedCart);
    }
    catch(error){
        console.error('Error loading cart:', error);
        res.status(500).json({ error: 'Failed to load cart' });
    }
});


app.delete('/api/cart/remove/:productId', requireAuthAPI, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        const productId= parseInt(req.params.productId);

        let cart= await persist.loadCart(username);
        cart= cart.filter(item=> item.productId != productId);

        await persist.saveCart(username, cart);
        await persist.logActivity(username, 'remove-from-cart', { productId });

        res.json({ success: true });
    }
    catch(error){
        res.status(500).json({ error: 'Failed removing from cart' });
    }
});


// update cart quantity (also for when clearing cart after purchase- resetting quanitity to 0)
app.put('/api/cart/update', requireAuthAPI, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        const { productId, quantity }= req.body;

        let cart= await persist.loadCart(username);
        const item= cart.find(item=> item.productId===productId);

        if(item){
            if(quantity===0){
                cart= cart.filter(item=> item.productId!==productId);
            }
            else{
                item.quantity= quantity;
            }
        }

        await persist.saveCart(username, cart);
        res.json({ success: true});

    }
    catch(error){
        res.status(500).json({ error: 'Failed to update cart' });
    }
});


// clear whole cart (like after purchase)
app.delete('/api/cart/clear', requireAuthAPI, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        await persist.saveCart(username, []);
        res.json({ success: true });
    }
    catch(error){
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});


// search a product in store - public API
app.get('/api/products/search', async(req, res)=> {
    try{
        // filter products by name/description
        const { q }= req.query;
        const products= await persist.loadProducts();

        const filtered= products.filter(p=>
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.description.toLowerCase().includes(q.toLocaleLowerCase())
        );

        res.json(filtered);
    }
    catch(error){
        res.status(500).json({ error: 'Failed to search product in store' });
    }
});


app.get('/api/admin/activities', requireAuthAPI, async(req, res)=> {
    try{
        // username filter from admin panel
        const { filter }= req.query;
        const activities= await persist.getActivities(filter);
        res.json(activities);
    }
    catch(error){
        res.status(500).json({ error: 'Failed to load activity logs' });
    }
});


app.post('/api/admin/products', requireAuthAPI, async(req, res)=> {
    try{
        const { name, description, price, customizable }= req.body;
        const newProduct= await persist.addProduct({
            name,
            description,
            price: parseFloat(price),
            customizable: customizable || false
        });

        await persist.logActivity(getCurrentUser(req), 'add-product', { productId: newProduct.id });
        res.json({ success: true, product: newProduct });
    }
    catch(error){
        res.status(500).json({ error: 'Failed to add product' });
    }
});


app.delete('/api/admin/products/:id', requireAuthAPI, async(req, res)=> {
    try{
        const productId= parseInt(req.params.id);
        await persist.removeProduct(productId);

        await persist.logActivity(getCurrentUser(req), 'remove-product', { productId });
        res.json({ success: true });
    }
    catch(error){
        res.status(500).json({ error: 'Failed to remove product' });
    }
});



app.post('/api/checkout', requireAuthAPI, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        // (fake payment)
        const { paymentDetails }= req.body;

        // get the current cart
        const cart= await persist.loadCart(username);
        if(cart.length==0){
            return res.json({ success: false, message: 'Cart is empty' });
        }

        // get cart details
        const products= await persist.loadProducts();
        let total= 0;
        const purchaseItems= cart.map(cartItem=> {
            const product= products.find(p=> p.id===cartItem.productId);
            const itemTotal= product.price*cartItem.quantity;
            total+=itemTotal;
            return {
                productId: cartItem.productId,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                itemTotal
            }
        });

        // save the purchase
        await persist.savePurchase(username, {
            items: purchaseItems,
            total,
            paymentDetails
        });

        // clear cart after purchase (empty array)
        await persist.saveCart(username, []);

        // log activity
        await persist.logActivity(username, 'purchase', { total, itemCount: cart.length });

        res.json({ success: true, total, items: purchaseItems });
    }
    catch(error){
        console.error('Checkout error: ', error);
        res.json({ success: false, error: 'Failed to checkout' });
    }
});



app.get('/api/purchases', requireAuthAPI, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        const purchases= await persist.getPurchases(username);
        res.json(purchases);
    }
    catch(error){
        res.status(500).json({ error: 'Failed to load purchases' });
    }
});


// get current user info for profile page
app.get('/api/users/current', requireAuthAPI, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        const users= await persist.loadUsers();
        const user= users.find(u=> u.username === username);

        if(user){
            // don't send password in response
            const { password, ...userInfo } = user;
            res.json(userInfo);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    }
    catch(error){
        res.status(500).json({ error: 'Failed to load user info' });
    }
});


// extra pages

app.post('/api/contact', requireAuthAPI, async(req, res)=> {
    try{
        const { name, email, message }= req.body;
        const contacts= await persist.loadData('contacts.json', []);

        contacts.push({
            id: Date.now(),
            name,
            email,
            message,
            timestamp: new Date().toISOString(),
            from: getCurrentUser(req)
        });

        await persist.saveData('contacts.json', contacts);
        res.json({ success: true, message: 'Message sent' });
    }
    catch(error){
        res.status(500).json({ error: 'Failed to send message' });
    }
})


app.put('/api/profile', requireAuthAPI, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        const { newUsername, email }= req.body;

        const users= await persist.loadUsers();
        const userIndex= users.findIndex(u=> u.username===username);

        if(userIndex!==-1){
            users[userIndex]= {...users[userIndex], username: newUsername, email };
            await persist.saveUsers(users);
        }

        res.json({ success: true });
    }
    catch(error){
        res.status(500).json({ error: 'Failed to update profile' });
    }
});


app.get('/api/wishlist', requireAuthAPI, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        const wishlists= await persist.loadData('wishlists.json', {});
        res.json(wishlists[username] || []);
    }
    catch(error){
        res.status(500).json({ error: 'Failed to load wishlist '});
    }
});


app.post('/api/wishlist/add', requireAuthAPI, async(req, res)=>{
    try{
        const username= getCurrentUser(req);
        const { productId }= req.body;

        const wishlists= await persist.loadData('wishlists.json', {});
        if(!wishlists[username]){
            wishlists[username]=[];
        }

        if(!wishlists[username].includes(productId)){
            wishlists[username].push(productId);
            await persist.saveData('wishlists.json', wishlists);
        }

        res.json({ success: true });
    }
    catch(error){
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
});


// start server
const server= app.listen(5000, ()=> {
    console.log("Express App running at http://127.0.0.1:5000/");
});