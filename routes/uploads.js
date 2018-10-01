require('date-utils');

var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var responseUtil = require('../util/responseUtil');

var mysql = require('mysql');
var conn = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});
conn.connect();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({storage: storage});

app.post('/board/free', upload.single('photo'), function(req, res){
  console.log(req.file);
  res.send('Uploaded : '+req.file.filename);
})


module.exports = router;
