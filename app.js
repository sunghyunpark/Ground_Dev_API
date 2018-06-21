var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended:true
}));

app.use('/api', require('./routes'));
app.use('/users', require('./routes/users'));

app.use(function(req, res, next){
  res.status(404);
  res.json({
    error : 'Not Found'
  });
  return;
});

app.listen(1038, function(){
  console.log('Connected, 1038 port!');
})
