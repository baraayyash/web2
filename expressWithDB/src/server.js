const express = require('express');
const pool = require('./db');
const app = express();
const port = 3000;

app.use(express.json());


app.get('/api/products', async (req, res) => {
    try {
        // Prodct.findAuLL()
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


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
