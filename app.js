var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended:false
}));
app.use(bodyParser.json());

app.use(function(erq, res, next){
  res.header('Access-Control-Allow_Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'content-type, x-access-token');
  next();
});

app.use('/static', express.static('public'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/community', require('./routes/community'));
app.use('/api/boards', require('./routes/boards'));
app.use('/api/my', require('./routes/my'));
app.use('/api/support', require('./routes/report'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/comment', require('./routes/comment'));
app.use('/api/home', require('./routes/home'));
app.use('/api/banner', require('./routes/banner'));
app.use('/api/uploads', require('./routes/uploads'));

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
