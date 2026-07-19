var express = require('express');
var router = express.Router();

const { uploadToAzure, getBlobSasUri } = require('../utils/blobService');
const rooms = require('../utils/equipments.json');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/api/upload', async function (req, res, next) {
  try {
    if (!req.files || !req.files.foo) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // console.log(req.files.foo); // the uploaded file object
    const response = await uploadToAzure(req.files.foo);
    res.send(response);
  } catch (err) {
    next(err);
  }
});

// Get Blob SAS URL
router.get('/api/blob/:foo', async function (req, res, next) {
  try {
    var response = await getBlobSasUri(req.params.foo);
    res.send(response);
  } catch (err) {
    next(err);
  }
});

router.get('/api/rooms/:id', function (req, res) {

  const room = rooms.find(room => room.id === req.params.id);

  if (!room) {
    res.status(404).json({ message: 'Room not found' });
  }

  res.json(room);
})

module.exports = router;
