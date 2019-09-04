// This node server holds our data. That's it.
// List of all required node modules (best practice to have these listed at the top)
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
// We use the bcryptjs module to hash/encrypt passwords, so we don't include them in our database
const bcrypt = require('bcryptjs');
// Require the config file
const config = require('./config.json');

// Get the model for our product (on mongoDB, database is called "shop"; table/database is "products")
const Product = require('./models/products');
// Get the model for our users
const User = require('./models/users');

// We used the const below when we were practising with a hard-coded database in data folder
// const allProducts = require('./data/products');

// Connect to mongoose
mongoose.connect(`mongodb+srv://${config.MONGO_USERNAME}:${config.MONGO_PASSWORD}@${config.MONGO_CLUSTER_NAME}.mongodb.net/shop?retryWrites=true&w=majority`, {useNewUrlParser: true});

// Test the connection to mongoose
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Brothers and sisters, we are all connected (to mongoDB)!');
});

// Convert incoming data to json data, which gets sent into JS so we can process it
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Allow cross-origin requests (i.e. http to https requests)
app.use(cors());

// Create a console message showing us what request we're asking for
app.use(function(req, res, next){
    console.log(`${req.method} request for ${req.url}`);
    next();
});

// Home route
app.get('/', function(req, res){
    res.send('Welcome to our Products API. Use endpoints to filter out the data');
});

// Add a new Product (CREATE)
app.post('/product', function(req, res){
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        user_id: req.body.userId
    });
    // console.log(product);
    // "save" below sends the user-inputted data (from front end) into our mongo database
    product.save().then(result => {
        res.send(result);
    })
    .catch(err => res.send(err));
});

// Get all products (READ)
app.get('/allProducts', function(req, res){
    // res.send(allProducts);
    Product.find().then((result) => {
        res.send(result);
    });
});

// Get a single product based on ID
app.post('/product/:id', function(req, res){
    const id = req.params.id;
    // We need to check if the product that we're asking for actually belongs to the
    // user who is requesting it. If it doesn't, then we'll send them back a 401 error.
    // The same thing is being done with the edit and delete functions.
    Product.findById(id, function (err, product) {
        if(product['user_id'] == req.body.userId){
            res.send(product);
        } else{
            res.send('401');
        }
    });
});

// Update a product based on its id
app.patch('/editProduct/:id', function(req, res){
    const id = req.params.id;
    Product.findById(id, function(err, product){
        if(product['user_id'] == req.body.userId){
            const newProduct = {
                name: req.body.name,
                price: req.body.price
            };
            Product.updateOne({ _id : id }, newProduct).then(result => {
                res.send(result);
            }).catch(err => res.send(err));
        } else {
            res.send('401');
        }
    }).catch(err => res.send('cannot find product with that id'));
});

// Delete a product based on id
app.delete('/product/:id', function(req, res){
    const id = req.params.id;
    Product.findById(id, function(err, product){
        if(product['user_id'] == req.body.userId){
            Product.deleteOne({ _id: id }, function (err) {
                res.send('deleted');
            });
        } else {
            res.send('401');
        }
    }).catch(err => res.send('cannot find product with that id'));
});

// REGISTER route
// Creating a route for registering new users; checking if the username already exists
app.post('/users', function(req, res){
    // We first want to check the database to see if there is already a user with the username we are registering
    // The findOne function requires you to specify what column you are searching in and then with what value.
    // In this example, we are searching the User table, for the row which for the column username, matches the value we type in the front end (req.body.username)
    User.findOne({ username: req.body.username }, function (err, checkUser) {
        // checkUser is the result of the findOne() function.
        // If we find one then checkUser is an object with all the information about the user, but if we don't then checkUser is nothihng/null/empty
        if(checkUser){
            // the username you are asking for already exists
            res.send('user already exists');
        } else {
            // the username you are asking for is available

            //hash the password
            const hash = bcrypt.hashSync(req.body.password);
            // Create a user based on the User Model and fill it with the values from the front end
            // Make sure to save your hashed password and not the regular one
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                username: req.body.username,
                email: req.body.email,
                password: hash
            });
            // Save the user in the database
            user.save().then(result => {
                // send the result back to the front end.
                res.send(result);
            }).catch(err => res.send(err));
        }
    });
})

// app.delete('/product/:id', function(req, res){
//     const id = req.params.id;
//     Product.deleteOne({ _id: id }, function (err) {
//         res.send('deleted');
//     });
// });

// Delete a product based on its id
// app.get('/product/delete/:id', function(req, res){
//     const productIDparam = req.params.id;
//     let filteredData = [];
//     for (var i = 0; i < allProducts.length; i++) {
//         if(allProducts[i].id.toString() === productIDparam){
//             filteredData.push(allProducts[i]);
//         }
//     }
//     res.send(filteredData);
// });

// Login Route
app.post('/getUser', function(req, res){
    // Just like the register route, we need to check to see if the username already exists (each username needs to be unique)
    User.findOne({ username: req.body.username }, function (err, checkUser) {;
        // If it already exists then we want to tell the user to choose another username
        if(checkUser){
            // A user exists

            // Now that we have checked to see if a username exists in the database, we need to check to see if the password matches
            // we need to check to see if the password the user is inputting matches the hashed password which is saved in the database
            // bcrypt.compareSync() checks to if they match
            if(bcrypt.compareSync(req.body.password, checkUser.password)){
                // password matches the hased password and sends back the information about the user
                res.send(checkUser);
            } else {
                // We found a user with the username you are asking for, but the password doesn't match
                res.send('invalid password');
            }
        } else {
            // A user doesnt exist
            // The front end user needs to register before logging in
            res.send('invalid user');
        }
    });

});

// Listen to the port number
app.listen(port, () => {
    console.clear();
    console.log(`application is running on port ${port}`)
});


// app.get('/product/edit/:id', function(req, res){
//     const productIDparam = req.params.id;
//     let filteredData = [];
//     for (var i = 0; i < allProducts.length; i++) {
//         if(allProducts[i].id.toString() === productIDparam){
//             filteredData.push(allProducts[i]);
//         }
//     }
//     res.send(filteredData);
// });

// app.get('/product/delete/:id', function(req, res){
//     const productIDparam = req.params.id;
//     let filteredData = [];
//     for (var i = 0; i < allProducts.length; i++) {
//         if(allProducts[i].id.toString() === productIDparam){
//             filteredData.push(allProducts[i]);
//         }
//     }
//     res.send(filteredData);
// });




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
// app.post('/users', function(req, res){
//     User.findOne({username: req.body.username}, function (err, checkUser) {
//         // res.send(checkUser);
//         if(checkUser){
//             res.send('Sorry, username already exists');
//         } else {
//             res.send('Username does not exist; everything is awesome!')
//             // USE hash to keep the password encrypted:
//             const hash = bcrypt.hashSync(req.body.password);
//             console.log(hash);
//             const user = new User({
//                 _id: new mongoose.Types.ObjectId(),
//                 username: req.body.username,
//                 email: req.body.email,
//                 password: hash
//             });
//             user.save().then(result =>{
//                 res.send(result);
//             })
//             .catch(err => res.send(err));
//         }
//     //
//     });
// });

// When user logs in:
// app.post('/getUser', function(req, res){
//     console.log('server connection working');
//     console.log(req.body.username);
//     console.log(req.body.password);
//
//     User.findOne({username: req.body.username}, function (err, checkUser) {
//         if(checkUser){
//             if (bcrypt.compareSync(req.body.password, checkUser.password)) {
//                 console.log('password matches');
//                 res.send(checkUser)
//             } else {
//                 console.log('password does not match');
//                 res.send('invalid password');
//             }
//         } else {
//             res.send('invalid user');
//             console.log('Log in and everything is awesome!')
//         }
//     });
// });
//
// app.listen(port, () => {
//     console.clear();
//     console.log(`application is running on port ${port}`)
// });
