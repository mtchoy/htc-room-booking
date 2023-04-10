var express = require('express');
var router = express.Router();

// const checkToken = require('../middlewares/checkToken');
const { connectToDB, ObjectId } = require('../util/db');

// Get all timeslot item
router.get('/', async (req, res) => {

    const { date, room } = req.query;

    if (!date) {
        res.status(400).json({ message: "Date is required" });
        return;
    }

    const dateObj = new Date(date);

    const query = { startTime: { $gt: dateObj } };

    if (room) {
        query.room = room;
        query.endTime = { $lt: new Date(dateObj.getTime() + 31 * 86400000) }
    } else {
        query.endTime = { $lt: new Date(dateObj.getTime() + 86400000) }
    }

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