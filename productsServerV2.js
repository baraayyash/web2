/**
 * Products API - CRUD example for teaching REST APIs
 * Run: node server-products.js
 *
 * | Method   | URL                  | Description        |
 * |----------|----------------------|--------------------|
 * | GET      | /api/products        | List all products  |
 * | GET      | /api/products/:id    | Get one product    |
 * | POST     | /api/products        | Create product     |
 * | PUT      | /api/products/:id    | Update product     |
 * | DELETE   | /api/products/:id    | Delete product     |
 */
const http = require('http');

const PORT = 3001;

// In-memory "database" - like a simple table of products
const products = [
    { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics' },
    { id: 2, name: 'Mouse', price: 29.99, category: 'Electronics' },
    { id: 3, name: 'Keyboard', price: 79.99, category: 'Electronics' }
];

// Helper: get product id from URL like /api/products/2 (split by /, take last part)
function getProductIdFromUrl(url) {
    const parts = url.split('/');
    const last = parts[parts.length - 1];
    const id = parseInt(last, 10);
    return isNaN(id) ? null : id;
}

// Helper: find product index by id
function findProductIndex(id) {
    return products.findIndex(p => p.id === id);
}

const server = http.createServer((request, response) => {
    const url = request.url;
    const method = request.method;

    console.log('Request URL:', url);
    console.log('Request method:', method);

    // ----- READ ALL (GET /api/products) -----
    if (url === '/api/products' && method === 'GET') {
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(products));
        return;
    }

    // ----- READ ONE (GET /api/products/:id) -----
    const productId = getProductIdFromUrl(url);
    if (productId !== null && method === 'GET') {
        const index = findProductIndex(productId);
        if (index === -1) {
            response.statusCode = 404;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ error: 'Product not found' }));
            return;
        }
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(products[index]));
        return;
    }

    // ----- CREATE (POST /api/products) -----
    if (url === '/api/products' && method === 'POST') {
        let body = '';
        request.on('data', chunk => { body += chunk.toString(); });
        request.on('end', () => {
            try {
                const data = JSON.parse(body || '{}');
                const newProduct = {
                    id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
                    name: data.name || 'Unknown',
                    price: parseFloat(data.price) || 0,
                    category: data.category || 'General'
                };
                products.push(newProduct);
                response.setHeader('Content-Type', 'application/json');
                response.statusCode = 201;
                response.end(JSON.stringify({ message: 'Product created', product: newProduct }));
            } catch (e) {
                response.statusCode = 400;
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    // ----- UPDATE (PUT /api/products/:id) -----
    if (productId !== null && method === 'PUT') {
        const index = findProductIndex(productId);
        if (index === -1) {
            response.statusCode = 404;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ error: 'Product not found' }));
            return;
        }
        let body = '';
        request.on('data', chunk => { body += chunk.toString(); });
        request.on('end', () => {
            try {
                const data = JSON.parse(body || '{}');
                if (data.name !== undefined) products[index].name = data.name;
                if (data.price !== undefined) products[index].price = parseFloat(data.price);
                if (data.category !== undefined) products[index].category = data.category;
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify({ message: 'Product updated', product: products[index] }));
            } catch (e) {
                response.statusCode = 400;
                response.setHeader('Content-Type', 'application/json');
                response.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    // ----- DELETE (DELETE /api/products/:id) -----
    if (productId !== null && method === 'DELETE') {
        const index = findProductIndex(productId);
        if (index === -1) {
            response.statusCode = 404;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ error: 'Product not found' }));
            return;
        }
        const deleted = products.splice(index, 1)[0];
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify({ message: 'Product deleted', product: deleted }));
        return;
    }

    // ----- 404 for unknown routes -----
    response.statusCode = 404;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
    console.log(`Products API server running at http://localhost:${PORT}/`);
    console.log('Endpoints: GET/POST /api/products, GET/PUT/DELETE /api/products/:id');
});
