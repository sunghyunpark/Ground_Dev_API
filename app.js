var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended:false
}));
app.use(bodyParser.json());

app.use('/api/users', require('./routes/users'));
app.use('/api/boards', require('./routes/boards'));
app.use('/api/my', require('./routes/my'));
app.use('/api/support', require('./routes/report'));
app.use('/api/chatbot', require('./routes/chatbot'));

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
