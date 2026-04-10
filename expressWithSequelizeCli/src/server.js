const express = require('express');
const app = express();
const {User} = require('../models');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/api/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

app.post('/api/v1/users', async (req, res) => {
    const { firstName, lastName, email } = req.body;
    if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: 'firstName, lastName and email are required' });
    }
    const user = await User.create(req.body);
    res.status(201).json(user);
});

app.post('/api/v2/users', async (req, res) => {
    const { firstName, lastName, email, address } = req.body;
    if (!firstName || !lastName || !email || !address) {
        return res.status(400).json({ error: 'firstName, lastName and email are required' });
    }
    const user = await User.create(req.body);
    res.status(201).json(user);
});


app.get('/api/test', async (req, res) => {
    res.json({ message: 'Hello World' });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
