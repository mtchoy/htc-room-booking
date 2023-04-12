var express = require('express');
var router = express.Router();

// const checkToken = require('../middlewares/checkToken');
const { connectToDB, ObjectId } = require('../utils/db');
const { sendEmail } = require('../utils/send-email');

// Create new booking item
router.post('/', async (req, res) => {
    const { userId, timeslotId, status } = req.body;
    const createdAt = new Date();
    const updatedAt = new Date();

    const db = await connectToDB();
    try {
        const result = await db.collection('booking').insertOne({ userId, status, createdAt, updatedAt });
        await db.collection('timeslot').updateOne({ _id: new ObjectId(timeslotId) }, { $set: { booking: result.insertedId, status, updatedAt } });
        res.status(200).json({ message: 'Booking created successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// Get all booking item
router.get('/', async (req, res) => {
    const { status, isReviewer } = req.query;
    const query = status ? { status } : {};

    if (isReviewer) {
        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    } else {
        query.userId = new ObjectId(req.user._id);
    }

    // pagination
    const page = req.query.page || 1;
    const limit = req.query.limit || 12;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || 'desc';

    const options = {
        limit: parseInt(limit),
        skip: parseInt(skip),
        sort: { _id: sort === 'desc' ? -1 : 1 }
    };

    const db = await connectToDB();
    try {
        const result = await db.collection('booking').find(query, options).toArray();

        // pagination
        const total = await db.collection('booking').countDocuments(query);
        const pages = Math.ceil(total / limit);
        res.status(200).json({ result, total, pages });

    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// Get booking item by id
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    const db = await connectToDB();
    try {
        const result = await db.collection('booking').findOne({ _id: new ObjectId(id) });
        res.status(200).json({ result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// Change booking status
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updatedAt = new Date();

    const db = await connectToDB();
    try {
        const result = await db.collection('booking').updateOne({ _id: new ObjectId(id) }, { $set: { status, updatedAt } });
        await db.collection('timeslot').updateOne({ booking: new ObjectId(id) }, { $set: { status, updatedAt } });

        sendEmail(result);

        res.status(200).json({ message: 'Booking status updated successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// Delete booking
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    const db = await connectToDB();
    try {
        const result = await db.collection('booking').deleteOne({ _id: new ObjectId(id) });
        await db.collection('timeslot').deleteOne({ booking: new ObjectId(id) });
        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

module.exports = router;