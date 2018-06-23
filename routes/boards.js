require('date-utils');
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var router = express.Router();

var mysql = require('mysql');
var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'qkr103838!@',
  database : 'ground_dev'
});
conn.connect();

router.post('/matching', function(req, res){
  var areaNo = req.body.areaNo;
  var uid = req.body.uid;
  var title = req.body.title;
  var contents = req.body.contents;

  if(areaNo < 9){
    console.log('seoul');
  }else if(areaNo > 9){
    console.log('gyeong gi');
  }else{
    console.log('error');
  }
})

module.exports = router;
