const express = require('express');
const { pool, sequelize } = require('./db');
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const customersRouter = require('./routes/customers');
const app = express();
const port = 3000;

app.use(express.json());


app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products order by id ASC');
        console.log(rows);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        console.log(rows);
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        const [result] = await pool.query('INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)', [name, description, price, stock]);
        console.log(result);
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Product not created' });
        }
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
        const product = rows[0];
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.put('/api/products/:id', async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        const [result] = await pool.query('UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?', [name, description, price, stock, req.params.id]);
        console.log(result);
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        const product = rows[0];
        res.json(product);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Product not deleted' });
        } else {
            res.sendStatus(204);
        }        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



///// CRUD Customers /////


app.use('/api/customers', customersRouter);



///// CRUD Orders /////




app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.findAll();
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/api/orders', async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.body.customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        const { customerId, product } = req.body;
        //const order = await Order.create({ customerId, product });
        const order = await customer.createOrder({ product });
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, { include: {model: Customer, attributes: ['name', 'phone']} });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const { product } = req.body;
        await order.update({ product });
        await order.reload();
        res.json(order);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        await order.destroy();
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/api/test', async (req, res) => {
    try {
        // eager loading
        //const customer = await Customer.findByPk(req.params.id, {include : Order});


        // lazy loading
        const customer = await Customer.findByPk(1);
        const order = await customer.getOrders();
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
}).catch((error) => {
    console.error('Unable to connect to the database:', error);
});

