const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB connection setup
//const client = new MongoClient("mongodb+srv://katareh:alpha@cluster0.zvrxw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
//const client = new MongoClient("mongodb+srv://katareh:alpha@cluster0.zvrxw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&tls=true");
//const client = new MongoClient("mongodb+srv://katareh:alpha@cluster0.zvrxw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&tls=true&tlsAllowInvalidCertificates=true&tlsVersion=TLS1_2");
const client = new MongoClient("mongodb+srv://alpha:alpha@cluster0.zvrxw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&tls=true");
let collection;

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db("mdbassignmentdatabase");
        collection = db.collection("mdbassignmentcollection");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}

connectDB();

app.use(express.json());

// Validation middleware
const validateUser = (req, res, next) => {
    const { id, firstName, lastName, hobby } = req.body;
    if (!id || !firstName || !lastName || !hobby) {
        return res.status(400).json({ message: 'Invalid input' });
    }
    next();
};

// GET all users
app.get('/users', async (req, res) => {
    try {
        const users = await collection.find().toArray();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

// GET user by ID
app.get('/users/:id', async (req, res) => {
    try {
        const user = await collection.findOne({ id: req.params.id });
        user ? res.status(200).json(user) : res.status(404).json({ message: 'User not found' });
    } catch (err) {
        res.status(500).json({ message: "Error fetching user" });
    }
});

// POST new user
app.post('/user', validateUser, async (req, res) => {
    try {
        await collection.insertOne(req.body);
        res.status(201).json({ message: 'User added successfully' });
    } catch (err) {
        res.status(500).json({ message: "Error adding user" });
    }
});

// PUT update user
app.put('/user/:id', validateUser, async (req, res) => {
    try {
        const result = await collection.updateOne({ id: req.params.id }, { $set: req.body });
        result.modifiedCount > 0
            ? res.status(200).json({ message: 'User updated successfully' })
            : res.status(404).json({ message: 'User not found' });
    } catch (err) {
        res.status(500).json({ message: "Error updating user" });
    }
});

// DELETE user
app.delete('/user/:id', async (req, res) => {
    try {
        const result = await collection.deleteOne({ id: req.params.id });
        result.deletedCount > 0
            ? res.status(200).json({ message: 'User deleted successfully' })
            : res.status(404).json({ message: 'User not found' });
    } catch (err) {
        res.status(500).json({ message: "Error deleting user" });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
