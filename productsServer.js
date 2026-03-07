const http = require('http');

const PORT = 3000;


const products = [
    {id: 1, name: 'Product 1', price: 100, description: 'Description 1', catagory: 'Catagory 1'},
    {id: 2, name: 'Product 2', price: 200, description: 'Description 2', catagory: 'Catagory 2'},
    {id: 3, name: 'Product 3', price: 300, description: 'Description 3', catagory: 'Catagory 3'}
];

const server = http.createServer((request, response) => {

    console.log(request.url);
    console.log(request.method);


    /****
     * 
     *  This logic should be enhanced to be used inside our GET/PUT/DELETE for a specific product
     * 
     * 
     * 
    
        // productId = request.url.split('/')[3];

        // console.log('Product ID: ' + productId);


        // let productIndex = products.findIndex(product => product.id === parseInt(productId));

        // console.log('productIndex: ' + productIndex);


        //     response.setHeader('Content-Type', 'application/json');
        //     response.statusCode = 200;
        //     response.end(JSON.stringify(products[productIndex]));


    ****/


    //get all products
    if (request.url === '/api/products' &&request.method === 'GET') {
        response.setHeader('Content-Type', 'application/json');
        response.statusCode = 200;
        response.end(JSON.stringify(products));
    }

    // // get product by id
    if (request.url === '/api/products/1' && request.method === 'GET'){

        response.setHeader('Content-Type', 'application/json');
        response.statusCode = 200;
        response.end(JSON.stringify(products[0]));
    }


    // create a new product
    if (request.url === '/api/products' && request.method === 'POST') {
        console.log('Creating a new product');
        let body = '';
        request.on('data', (chunks) => {
            body += chunks.toString();
        });

        request.on('end', () => {
            const data = JSON.parse(body);
            const newProduct = { id: products.length + 1, name: data.name, price: data.price, description: data.description, catagory: data.catagory };
            products.push(newProduct);
            response.setHeader('Content-Type', 'application/json');
            response.statusCode = 201;
            response.end(JSON.stringify(newProduct));
        });
    }


    if (request.url === '/api/products/1' && request.method === 'PUT') {
        let body = '';
        request.on('data', (chunks) => {
            body += chunks.toString();
        });

        request.on('end', () => {
            const data = JSON.parse(body);
            const productToUpdate = { id: data.id, name: data.name, price: data.price, description: data.description, catagory: data.catagory };
            products[0] = productToUpdate;
            response.setHeader('Content-Type', 'application/json');
            response.statusCode = 200;
            response.end(JSON.stringify(products[0]));
        });

    }

    if (request.url === '/api/products/1' && request.method === 'DELETE') {
        products.splice(0, 1);
        response.setHeader('Content-Type', 'application/json');
        response.statusCode = 200;
        response.end(JSON.stringify({ message: 'Product deleted' }));
    }

    response.statusCode = 404;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ message: 'Route not found' }));


});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

// Products Server

// 1- Get all products
// 2- Get product by ID
// 3- Create a new product 
// 4- Update a product
// 5- Delete a product
