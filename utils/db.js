const { MongoClient, ObjectId } = require('mongodb');

if (!process.env.MONGODB_URI) {
    // throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
}

// Connect to MongoDB
async function connectToDB() {
    const client = await MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true });
    const db = client.db('room-booking');
    db.client = client;
    return db;
}

module.exports = { connectToDB, ObjectId };