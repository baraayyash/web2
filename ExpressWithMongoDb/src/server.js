const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;


connectDB(uri).then(() => {

    console.log('Connected to MongoDB');


    const app = express();

    app.use(express.json());

    app.get('/', (req, res) => {
        res.send('Hello World');
    });

    app.get('/api/users', async (req, res) => {
        try {
            const users = await User.find();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching users' });
        }
    });

    app.post('/api/users/', async (req, res) => {
        try {
            const user = await User.create(req.body);
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error creating user' });
        }
    });


    app.get('/api/users/:id', async (req, res) => {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user' });
        }
    });

    app.put('/api/users/:id', async (req, res) => {
        try {
            const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Error updating user', error: error.message });
        }
    });

    app.delete('/api/users/:id', async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({ message: 'User deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ message: 'Error deleting user', error: error.message });
        }
    });


    app.get('/api/products', async (req, res) => {
        try {
            const products = await Product.find();
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching products', error: error.message });
        }
    });


    app.post('/api/products', async (req, res) => {
        try {
            const product = await Product.create(req.body);
            res.status(201).json(product);
        } catch (error) {
            res.status(500).json({ message: 'Error creating product' });
        }
    });

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
});
