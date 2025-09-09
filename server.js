const express= require('express');
const cookieParser= require('cookie-parser');
//const cookieValidator= require('./cookieValidator')
const path = require('path');

const app= express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(express.static('public'));

// basic routes (home page is /login.html)
app.get('/', (req, res)=> {
    res.redirect('/login.html');
});

// screen modules imports 
// TODO:(uncomment after implementing them)
// const loginServer= require('./screens/login-server');
// const storeServer= require('./screens/store-server');
// const adminServer= require('./screens/admin-server');
// const cartServer= require('./screens/cart-server');
// const checkoutServer= require('./screens/checkout-server');
// const registerServer= require('./screens/register-server');


//TODO: create POST /login route
// handle authentication login!! (or import from "login-server.js")
app.post('/login', (req, res)=> {
    res.
});


// TODO: create middleware for route protection (??)
function requireAuth(req, res, next){

}

// TODO: add protected routes
app.get('/store.html', requireAuth, (req, res)=> {

});


const server= app.listen(5000, ()=> {
    console.log("Express App running at http://127.0.0.1:5000/");
});