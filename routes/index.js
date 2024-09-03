var express = require('express');
var router = express.Router();

const { uploadToAzure, getBlobSasUri } = require('../utils/storage-blob');
const rooms = require('../utils/equipments.json');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/api/upload', async function (req, res) {
  console.log(req.files.foo); // the uploaded file object
  const url = await uploadToAzure(req.files.foo);

  console.log(url.split("/").pop().toLowerCase());

  res.send(url.split("/").pop().toLowerCase());

  // res.send('File uploaded!')
});

// Get Blob SAS URL
router.get('/api/blob/:foo', async function (req, res) {

  var response = await getBlobSasUri(req.params.foo);

  res.send(response);
});

router.get('/api/rooms/:id', function (req, res) {

  const room = rooms.find(room => room.id === req.params.id);

  if (!room) {
    res.status(404).json({ message: 'Room not found' });
  }

  res.json(room);
})

module.exports = router;
