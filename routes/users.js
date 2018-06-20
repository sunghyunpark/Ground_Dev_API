var express = require('express');
var router = express.Router();

/*
var mysql = require('mysql');
var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'qkr103838!@',
  database : 'ground_dev'
});
conn.connect();
*/

router.post('/users/register', function(req, res){
  var uid = req.body.uid;
  var nickName = req.body.nickName;
  var time = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
  console.log(time);
})
