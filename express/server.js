const express = require('express');
const app = express();
const port = 3000;

let products = [
    {
        id: 1,
        name: 'Product 1',
        price: 100
    },
    {
        id: 2,
        name: 'Product 2',  
        price: 200
    }
];

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/about', (req, res) => {
    res.send('About');
});


app.get('/api/products', (req, res) => {
    res.json(products);
});





app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
