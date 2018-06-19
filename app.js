require('date-utils');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
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
app.use(bodyParser.urlencoded({
  extended:false
}));

app.post('/users/register', function(req, res){
  var uid = req.body.uid;
  var nickName = req.body.nickName;
  var time = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
  console.log(time);
})

app.listen(1038, function(){
  console.log('Connected, 1038 port!');
})
