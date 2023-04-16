var express = require('express');
var router = express.Router();

// const checkToken = require('../middlewares/checkToken');
const { connectToDB, ObjectId } = require('../utils/db');
const { sendEmail } = require('../utils/send-email');

// Create new booking item
router.post('/', async (req, res) => {
    const { room, date, startTime, endTime, user, recurrent, repeatedTimes } = req.body;

    if (!(room && date && startTime && endTime && user))
        return res.badRequest("Missing attribute(s).");

    if (!(recurrent == 0 || recurrent == 1 || recurrent == 7)) {
        return res.badRequest("Invalid recurrent value.");
    }

    var rT = 1;
    if (recurrent != 0) rT = parseInt(repeatedTimes) || 1;

    var nextDay = parseInt(recurrent) || 0;

    var qStartTime = new Date(date + " " + startTime);
    var qEndTime = new Date(date + " " + endTime);

    var timeslots = [];

    const db = await connectToDB();
    try {
        for (var i = 0; i < rT; i++) {
            matched = await db.collection('timeslot').findOne({
                room: room,
                status: { $in: ["Pending", "Approved"] },
                $or: [
                    { startTime: { $lt: qStartTime }, endTime: { $gt: qStartTime } },
                    { startTime: { $lt: qEndTime }, endTime: { $gt: qEndTime } },
                    { startTime: { $gt: qStartTime }, endTime: { $lt: qEndTime } }
                ]
            });

            if (matched) return res.status(409).json({ message: 'Timeslot is not available' });

            timeslots.push({ startTime: new Date(qStartTime), endTime: new Date(qEndTime) });

            qStartTime.setDate(qStartTime.getDate() + nextDay);
            qEndTime.setDate(qEndTime.getDate() + nextDay);
        }

        if (req.user.canApprove || (room == "Rm514" && !/^s\d{6}$/.test(req.user.username.toLowerCase())))
            req.body.status = "Approved";
        else {
            req.body.status = "Pending";
        }

        req.body.username = req.user.username;
        req.body.createdAt = new Date();
        req.body.updatedAt = new Date();

        const booking = await db.collection('booking').insertOne(req.body);

        for (var timeslot of timeslots) {
            timeslot.booking = booking._id;
            timeslot.room = room;
            timeslot.status = req.body.status;
        }

        await db.collection('timeslot').insertMany(timeslots);
        res.status(200).json({ message: 'Booking created successfully' });

    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// Get all booking item
router.get('/', async (req, res) => {
    const { status, is_reviewer } = req.query;
    const query = status ? { status } : {};

    req.user = { role: 'admin' };

    if (is_reviewer) {
        if (req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    } else {
        query.userId = new ObjectId(req.user._id);
    }

    delete query.userId;

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

router.get('/oid/:id', async (req, res) => {
    const { id } = req.params;

    const db = await connectToDB();
    try {
        const result = await db.collection('booking').findOne({ id: parseInt(id) });
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
        await db.collection('timeslot').updateMany({ booking: new ObjectId(id) }, { $set: { status, updatedAt } });

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