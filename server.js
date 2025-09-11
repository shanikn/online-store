// require statements
const express= require('express');
const cookieParser= require('cookie-parser');
const path= require('path');
const persist= require('./persist_module'); 

// screen modules imports 
// TODO:(uncomment after implementing them)
// const loginServer= require('./screens/login-server');
// const storeServer= require('./screens/store-server');
// const adminServer= require('./screens/admin-server');
// const cartServer= require('./screens/cart-server');
// const checkoutServer= require('./screens/checkout-server');
// const registerServer= require('./screens/register-server');


// app startup
const app= express();

// middleware
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
    // (home page is /login.html)
    res.redirect('/login.html');
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

        // clear the cookie on logout
        res.clearCookie('userToken');

        // and log the logout itself in activity.json
        if(username){
            await persist.logActivity(username, 'logout');
        }

        res.json({ success: true, redirect: '/login.html' });
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



// protected html pages (store, cart, admin)
app.get('/store.html', requireAuth, (req, res)=> {
    res.sendFile(path.join(__dirname, 'public', 'store.html'));
});


app.get('/cart.html', requireAuth, (req, res)=> {
    res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});


app.get('/admin.html', requireAuth, (req, res)=> {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});




// API routes (AJAX)
app.get('/api/products', requireAuth, async(req, res)=> {
    try{
        const products= await persist.loadProducts();
        res.json(products);
    }
    catch(error){
        console.error('Error loading products: ', error);
        res.status(500).json({ error: 'Failed to load products' });
    }
});


app.post('/api/cart/add', requireAuth, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        const { productId }= req.body;

        // get the user cart
        const cart= await persist.loadCart(username);

        // add the new item to cart (if item already exists, add 1 to quantity)
        const existingItem= cart.find(item=> item.productId === productId);
        if(existingItem){
            existingItem.quantity+=1;
        }
        else{
            cart.push({ productId, quantity: 1, addedAt: new Date().toISOString() });
        }

        // save the cart
        await persist.saveCart(username, cart);

        // log activity
        await persist.logActivity(username, 'add-to-cart', { productId });
        res.json({ success: true });
    } 
    catch(error){
        console.error('Error adding to cart: ', error);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

// get user cart
app.get('/api/cart', requireAuth, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        const cart= await persist.loadCart(username);
        res.json(cart);
    }
    catch(error){
        res.status(500).json({ error: 'Failed to load cart' });
    }
});


app.delete('/api/cart/remove/:productId', requireAuth, async(req, res)=> {
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
app.put('/api/cart/update', requireAuth, async(req, res)=> {
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
app.delete('/api/cart/clear', requireAuth, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        await persist.saveCart(username, []);
        res.json({ success: true });
    }
    catch(error){
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});


// search a product in store
app.get('/api/products/search', requireAuth, async(req, res)=> {
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


app.get('/api/admin/activities', requireAuth, async(req, res)=> {
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


app.post('/api/admin/products', requireAuth, async(req, res)=> {
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


app.delete('/api/admin/products/:id', requireAuth, async(req, res)=> {
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



app.post('/api/checkout', requireAuth, async(req, res)=> {
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
        res.status(500).json({ error: 'Failed to checkout' });
    }
});



app.get('/api/purchases', requireAuth, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        const purchases= await persist.getPurchases(username);
        res.json(purchases);
    }
    catch(error){
        res.status(500).json({ error: 'Failed to load purchases' });
    }
});


// extra pages

app.post('/api/contact', requireAuth, async(req, res)=> {
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


app.put('/api/profile', requireAuth, async(req, res)=> {
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


app.get('/api/wishlist', requireAuth, async(req, res)=> {
    try{
        const username= getCurrentUser(req);
        const wishlists= await persist.loadData('wishlists.json', {});
        res.json(wishlists[username] || []);
    }
    catch(error){
        res.status(500).json({ error: 'Failed to load wishlist '});
    }
});


app.post('/api/wishlist/add', requireAuth, async(req, res)=>{
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