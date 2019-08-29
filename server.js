// This node server holds our data. That's it.
// list of all required node modules (best practice to have these listed at the top)
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config.json');
const Product = require('./models/products');
const User = require('./models/users');
// database is called "shop"; table/database is "products"
mongoose.connect(`mongodb+srv://${config.MONGO_USERNAME}:${config.MONGO_PASSWORD}@cluster0-vvglk.mongodb.net/shop?retryWrites=true&w=majority`, {useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Brothers and sisters, we are all connected!');
});

const allProducts = require('./data/products');

// To read all incoming data as json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

app.use(function(req, res, next){
    console.log(`${req.method} request for ${req.url}`);
    next();
});

app.get('/', function(req, res){
    res.send('Welcome to our Products API. Use endpoints to filter out the data');
});

app.get('/allProducts', function(req, res){
    // res.send(allProducts);
    Product.find().then((result) => {
        res.send(result);
    });
});

// app.get('/:id', function(req, res){
//     res.send(allProducts);
// });
app.get('/product/:id', function(req, res){
    const id = req.params.id;
    Product.findById(id, function (err, product) {
        res.send(product);
    });
    // const id = req.params.id;
    // for (var i = 0; i < allProducts.length; i++) {
    //     if(id == allProducts[i].id){
    //         res.send(allProducts[i]);
    //         break;
        // }
    // }
});


// Code below didn't work:
// app.get('/product/:id', function(req, res){
//     const productIDparam = req.params.id;
//     let filteredData = [];
//     for (var i = 0; i < allProducts.length; i++) {
//         if(allProducts[i].id.toString() === productIDparam){
//             filteredData.push(allProducts[i]);
//         }
//     }
//     res.send(filteredData);
// });

app.get('/product/edit/:id', function(req, res){
    const productIDparam = req.params.id;
    let filteredData = [];
    for (var i = 0; i < allProducts.length; i++) {
        if(allProducts[i].id.toString() === productIDparam){
            filteredData.push(allProducts[i]);
        }
    }
    res.send(filteredData);
});

app.get('/product/delete/:id', function(req, res){
    const productIDparam = req.params.id;
    let filteredData = [];
    for (var i = 0; i < allProducts.length; i++) {
        if(allProducts[i].id.toString() === productIDparam){
            filteredData.push(allProducts[i]);
        }
    }
    res.send(filteredData);
});


app.post('/product', function(req, res){
    // console.log('a post request has been made');
    // console.log(req.body);
    // let product = {
    //     name: req.body.name,
    //     price: req.body.price,
    //     message: 'We are about to send this product to a database'
    // };
    // res.send(product);

    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    console.log(product);
    // "save" below sends the user-inputted data (from front end) into our mongo database
    product.save().then(result => {
        res.send(result);
    })
    .catch(err => res.send(err));
});

app.patch('/editProduct/:id', function(req,res){
   const id = req.params.id;
   const newProduct = {
     name: req.body.name,
     price: req.body.price
   }
   Product.updateOne({_id: id}, newProduct).then(result => {
     res.send(result);
   }).catch(err => res.send(err));
});

const Contact = require('./models/contacts');
app.post('/contact', function(req, res){
    const contact = new Contact({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        message: req.body.message
    });
    console.log(contact);
    // "save" below sends the user-inputted data (from front end) into our mongo database
    contact.save().then(result => {
        res.send(result);
    })
    .catch(err => res.send(err));
});

// How to get input from user at front end: req.body.xxx
// const username = req.body.username;
// console.log(req.body.username);
// console.log(req.body.email);
// console.log(req.body.password);

// Creating a route for REGISTERING new users; checking if the username already exists
app.post('/users', function(req, res){
    User.findOne({username: req.body.username}, function (err, checkUser) {
        // res.send(checkUser);
        if(checkUser){
            res.send('Sorry, username already exists');
        } else {
            res.send('Username does not exist; everything is awesome!')
            // USE hash to keep the password encrypted:
            const hash = bcrypt.hashSync(req.body.password);
            console.log(hash);
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                username: req.body.username,
                email: req.body.email,
                password: hash
            });
            user.save().then(result =>{
                res.send(result);
            })
            .catch(err => res.send(err));
        }
    //
    });
});

// When user logs in:
app.post('/getUser', function(req, res){
    console.log('server connection working');
    console.log(req.body.username);
    console.log(req.body.password);

    User.findOne({username: req.body.username}, function (err, checkUser) {
        if(checkUser){
            if (bcrypt.compareSync(req.body.password, checkUser.password)) {
                console.log('password matches');
                res.send(checkUser)
            } else {
                console.log('password does not match');
                res.send('invalid password');
            }
        } else {
            res.send('invalid user');
            console.log('Log in and everything is awesome!')
        }
    });
});

app.listen(port, () => {
    console.clear();
    console.log(`application is running on port ${port}`)
});
