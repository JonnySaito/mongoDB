const express = require('express');
const app = express();
const port = 3000;

const allProducts = require('./data/products');



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
