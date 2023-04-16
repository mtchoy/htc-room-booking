var express = require('express');
var router = express.Router();

const { uploadToAzure, downloadFromAzure } = require('../utils/storage-blob');
const rooms = require('../utils/equipments.json');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload', function (req, res) {
  console.log(req.files.foo); // the uploaded file object
  uploadToAzure(req.files.foo);
  res.send('File uploaded!')
});

router.get('/rooms/:id', function (req, res) {

  const room = rooms.find(room => room.id === req.params.id);

  if (!room) {
    res.status(404).json({ message: 'Room not found' });
  }

  res.json(room);
})

module.exports = router;
