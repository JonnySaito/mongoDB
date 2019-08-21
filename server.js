// list of all required node modules (best practice to have these listed at the top)
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cors = require('cors');

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
    res.send(allProducts);
});

// app.get('/:id', function(req, res){
//     res.send(allProducts);
// });

app.get('/product/:id', function(req, res){
    const productIDparam = req.params.id;
    let filteredData = [];
    for (var i = 0; i < allProducts.length; i++) {
        if(allProducts[i].id.toString() === productIDparam){
            filteredData.push(allProducts[i]);
        }
    }
    res.send(filteredData);
});

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

app.listen(port, () => {
    console.clear();
    console.log(`application is running on port ${port}`)
});

app.post('/product', function(req, res){
    // console.log('a post request has been made');
    // console.log(req.body);
    let product = {
        name: req.body.name,
        price: req.body.price,
        message: 'We are about to send this product to a database'
    };
    res.send(product);
})
