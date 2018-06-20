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
var users = require('./routes/users');

app.use('/api', users);

app.use(function(req, res, next){
  res.status(404);
  res.json({
    error : 'Not Found'
  });
});

app.use(bodyParser.urlencoded({
  extended:false
}));

app.listen(1038, function(){
  console.log('Connected, 1038 port!');
})
