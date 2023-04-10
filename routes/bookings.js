var express = require('express');
var router = express.Router();

// const checkToken = require('../middlewares/checkToken');
const { connectToDB, ObjectId } = require('../util/db');

// Get all booking item
router.get('/', async (req, res) => {

    const { status, isMine } = req.query;
    
    const query = status ? { status } : {};

    if (isMine === 'true') {
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


module.exports = router;