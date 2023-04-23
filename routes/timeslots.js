var express = require('express');
var router = express.Router();

const { addDays } = require('date-fns')
// const checkToken = require('../middlewares/checkToken');
const { connectToDB, ObjectId } = require('../utils/db');

// Get all timeslot item
router.get('/', async (req, res) => {

    const { date, room } = req.query;

    if (!date) {
        res.status(400).json({ message: "Date is required" });
        return;
    }

    var startDate = new Date(date);
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

module.exports = router;