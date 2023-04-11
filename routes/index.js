var express = require('express');
var router = express.Router();

const { uploadToAzure, downloadFromAzure } = require('../utils/storage-blob');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload', function(req, res) {
  console.log(req.files.foo); // the uploaded file object
  uploadToAzure(req.files.foo);
  res.send('File uploaded!')
});

module.exports = router;
