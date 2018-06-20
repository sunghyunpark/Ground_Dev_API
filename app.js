var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');

var users = require('./routes/users');

app.use('/users, users');

app.use(function(req, res, next){
  res.status(404);
  res.json({
    error : 'Not Found'
  });
  return;
});

app.use(bodyParser.urlencoded({
  extended:false
}));

app.listen(1038, function(){
  console.log('Connected, 1038 port!');
})
