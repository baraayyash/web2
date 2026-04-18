const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Reuse one salt so the same plaintext always produces the same hash string.
// For real user passwords, prefer bcrypt.hash(password, 10) (random salt per user) and bcrypt.compare on login.
const BCRYPT_FIXED_SALT =
    process.env.BCRYPT_FIXED_SALT || '$2b$10$lawkghdZrHiQAI8z0CBmuu';

const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;


connectDB(uri).then(() => {

    console.log('Connected to MongoDB');


    const app = express();

    app.use(express.json());

    app.get('/', async (req, res) => {
        const hashedstring = await bcrypt.hash('randomstring', BCRYPT_FIXED_SALT);
        res.send(hashedstring);
    });


    app.get('/api/users', async (req, res) => {
        try {
            const users = await User.find();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching users' });
        }
    });


    app.post('/api/auth/signup', async (req, res) => {  
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, BCRYPT_FIXED_SALT);
            const email = req.body.email;
            const user = await User.create({email, password: hashedPassword});
            res.status(201).json(user);
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ message: 'Error creating user' });
        }
    });

    app.post('/api/auth/login', async (req, res) => {
        try {
            const user = await User.findOne({email: req.body.email});
            if (!user) {
                return res.status(401).json({ message: 'Invalid email' });
            }
            const password = req.body.password;
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid password' });
            }
            res.status(200).json({ message: 'Login successful' });
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ message: 'Error logging in' });
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
