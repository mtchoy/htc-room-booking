var express = require('express');
var router = express.Router();

const { addBusinessDays, formatISO9075, addDays } = require('date-fns')
// const checkToken = require('../middlewares/checkToken');
const { connectToDB, ObjectId } = require('../utils/db');
const { sendEmail } = require('../utils/send-email');
const verifyToken = require('../middlewares/verifyToken');
const { getBlobSasUri } = require('../utils/storage-blob');

// Create new booking iteme
router.post('/', async (req, res) => {
    const { room, date, startTime, endTime, user, teacher, recurrent, repeatedTimes } = req.body;

    if (!(room && date && startTime && endTime && user))
        return res.badRequest("Missing attribute(s).");

    if (!(recurrent == 0 || recurrent == 1 || recurrent == 7)) {
        return res.badRequest("Invalid recurrent value.");
    }

    if (!teacher && !req.user.canApprove) {
        return res.badRequest("No Teaching in Charge.");
    }

    if (startTime < "07:00:00") {
        return res.badRequest("Start Time too early.");
    }

    if (endTime > "18:00:00") {
        return res.badRequest("End Time too late.");
    }

    if (endTime < startTime) {
        return res.badRequest("End Time before Start Time.");
    }

    if (date < formatISO9075(addBusinessDays(new Date(), 2), { representation: 'date' }) && !req.user.canApprove) {
        return res.badRequest("Need two working days for approval.");
    }

    var rT = 1;
    if (recurrent != 0) rT = parseInt(repeatedTimes) || 1;

    var daysToAdd = parseInt(recurrent) || 0;

    var slotStart = new Date(`${date}T${startTime}+08:00`);
    var slotEnd = new Date(`${date}T${endTime}+08:00`);
    // var slotEnd = new Date(date + " " + endTime);

    var timeslots = [];
    var queries = [];

    for (var i = 0; i < rT; i++) {

        queries.push(
            { startTime: { $lte: slotStart }, endTime: { $gt: slotStart } },
            { startTime: { $lt: slotEnd }, endTime: { $gte: slotEnd } },
            { startTime: { $gte: slotStart }, endTime: { $lte: slotEnd } }
        )

        timeslots.push({ startTime: slotStart, endTime: slotEnd });

        slotStart = addDays(slotStart, daysToAdd);
        slotEnd = addDays(slotEnd, daysToAdd);
    }

    // console.log(queries)

    const db = await connectToDB();
    try {
        var matched = await db.collection('timeslot').findOne({
            room: room,
            status: { $in: ["Pending", "Approved"] },
            $or: queries
        });

        if (matched) return res.status(409).json({ message: 'At least one timeslot is not available.' });

        // teacher can book
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
            timeslot.booking = booking.insertedId;
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

    console.log(req.user)

    if (is_reviewer) {
        if (!req.user.canSeeList) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    } else {
        // query.userId = new ObjectId(req.user._id);
        query.username = req.user.username;
    }

    // delete query.userId;

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
        
        if (!result) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (result.username !== req.user.username && !req.user.canSeeOne) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        result.isOwner = result.username === req.user.username; 

        if (result.filename) {
            result.imageUri = await getBlobSasUri(result.filename);
        }

        res.status(200).json({ result });
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

// router.get('/oid/:id', async (req, res) => {
//     const { id } = req.params;

//     const db = await connectToDB();
//     try {
//         const result = await db.collection('booking').findOne({ id: parseInt(id) });
//         res.status(200).json({ result });
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     } finally {
//         await db.client.close();
//     }
// });

// Change booking status
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updatedAt = new Date();

    if (!req.user.canApprove) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const db = await connectToDB();
    try {
        const result = await db.collection('booking').updateOne({ _id: new ObjectId(id) }, { $set: { status, updatedAt } });

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        await db.collection('timeslot').updateMany({ booking: new ObjectId(id) }, { $set: { status, updatedAt } });
        
        // send email
        const booking = await db.collection('booking').findOne({ _id: new ObjectId(id) });
        sendEmail(booking);

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
        const booking = await db.collection('booking').findOne({ _id: new ObjectId(id) });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.username !== req.user.username && !req.user.canApprove) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const result = await db.collection('booking').deleteOne({ _id: new ObjectId(id) });
        await db.collection('timeslot').deleteMany({ booking: new ObjectId(id) });
        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

module.exports = router;