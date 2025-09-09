const express= require('express')
const cookieParser= require('cookie-parser')
const cookieValidator= require('./cookieValidator')

const app= express()

app.get('/', function(req, res){
        res.send('Hello World!');
})

app.post('/login', (req, res)=> {
    res.
})
const server= app.listen(5000, function () {
    console.log("Express App running at http://127.0.0.1:5000/");
})