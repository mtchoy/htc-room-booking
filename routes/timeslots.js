var express = require('express');
var router = express.Router();

const { addDays, parseISO } = require('date-fns')
// const checkToken = require('../middlewares/checkToken');
const { connectToDB, ObjectId } = require('../utils/db');

// Get all timeslot item
router.get('/', async (req, res) => {

    const { date, room } = req.query;

    if (!date) {
        res.status(400).json({ message: "Date is required" });
        return;
    }

    // var startDate = new Date(date);
    var startDate = parseISO(date);
    const query = { startTime: { $gt: startDate } };

    if (room) {
        query.room = room;
        var endDate = addDays(startDate, 31)
        // endDate.setDate(startDate.getDate() + 31) // 31 days
    } else {
        var endDate = addDays(startDate, 1)
        // endDate.setDate(startDate.getDate() + 1) // 1 day
    }

    query.endTime = { $lt: endDate }
    query.status = { $in: ["Pending", "Approved", "Blocked"] }

    const db = await connectToDB();
    try {
        const result = await db.collection('timeslot').find(query).toArray();
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});


// Get timeslots and their bookings, by date, sorted by room, and then start time
router.get('/bookings', async (req, res) => {

    const { date } = req.query;

    if (!date) {
        res.status(400).json({ message: "Date is required" });
        return;
    }

    // var startDate = new Date(date);
    var startDate = parseISO(date);
    var endDate = addDays(startDate, 1)

    // var startDate = new Date();
    // var endDate = addDays(startDate, 1)
    // // endDate.setDate(startDate.getDate() + 1) // 1 day

    const query = { startTime: { $gt: startDate }, endTime: { $lt: endDate }, status: { $in: ["Approved", "Blocked"] } };

    const db = await connectToDB();
    try {
        var pipeline = [
            {
                $match: query
            },
            {
                $lookup: {
                    from: "booking",
                    localField: "booking",
                    foreignField: "_id",
                    as: "bookings"
                }
            },
            {
                $sort: {
                    room: 1,
                    startTime: 1
                }
            }
        ]

        const result = await db.collection('timeslot').aggregate(pipeline).toArray();
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});


module.exports = router;