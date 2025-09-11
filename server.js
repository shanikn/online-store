// require statements
const express= require('express');
const cookieParser= require('cookie-parser');
const path = require('path');

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
    if(req.cookies.userToken) {
        // the user is logged in=> continue
        next();
    }
    else{
        // the user isn't logged in=> redirect to login screen
        res.redirect('/login.html');
    }
}

// IMPLEMENT: (implement later) 
// get user from cookies
function getCurrentUser(){

}


// more helper functions- rate limiting functions





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
    
        // TODO: change after implementing persist_module.js (placeholder for now)
        if(username ==='admin' && password === 'admin'){
            // set cookie with experation time (12 days or 30 minutes)
            const maxAge= remember ? (12*24*60*60*1000) : (30*60*1000);
            res.cookie('userToken', username, {maxAge: maxAge});

            // TODO: log activity (change after implementing persist_module.js)
            // await logActivity(username, 'login);

            // on login success (valid input): send success response & redirect to store screen
            res.json({ success: true, redirect: '/store.html'});
        }
        else{
            // on login error (invalid input): send error response & display error message
            res.json({ success: false, message: 'Invalid credentials'});
        }
    }
    catch(error){
        // error handling
        console.error('Login error: ', error);
        res.status(500).json({ success: false, message: 'Server error'});
    }
});

// IMPLEMENT: logout post
app.post('/logout', async(req, res)=> {

});

// IMPLEMENT: register post
app.post('/register', async(req, res)=> {

});



// protected html pages (store, cart, admin)
// IMPLEMENT: store get
app.get('/store.html', requireAuth, (req, res)=> {
    // requireAuth runs first

    // user had cookie=> next()=> my handler runs ()
    
    // no cookie=> redirect to login=> my handler NEVER runs

});


// IMPLEMENT: cart get
app.get('/cart.html', requireAuth, (req, res)=> {
    // requireAuth runs first

    // user had cookie=> next()=> my handler runs ()
    
    // no cookie=> redirect to login=> my handler NEVER runs

});


// IMPLEMENT: admin get
app.get('/admin.html', requireAuth, (req, res)=> {
    // requireAuth runs first

    // user had cookie=> next()=> my handler runs ()
    
    // no cookie=> redirect to login=> my handler NEVER runs

});


// API routes (AJAX)
// IMPLEMENT: api/products get
app.get('/api/products', requireAuth, (req, res)=> {

});

// IMPLEMENT: api/cart/add post
app.post('/api/cart/add', requireAuth, (req, res)=> {

});



// start server
const server= app.listen(5000, ()=> {
    console.log("Express App running at http://127.0.0.1:5000/");
});