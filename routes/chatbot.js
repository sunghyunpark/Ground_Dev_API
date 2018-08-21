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

router.get('/kakao/keyboard', function(req, res){
  var data = {
    'type' : 'buttons',
    'buttons' : ['ground1', 'ground2', 'ground3']
  };
  res.json(data);
})

router.post('/kakao/message', function(req, res){
  var msg = req.body.content;

  var response;

  switch (msg) {
    case 'ground1':
    response = {
      'message' : {
        'text' : 'ground1 선택'
      }
    }
      break;

      case 'hello':
      reponse = {
        'message' : {
          'text' : 'hello 선택'
        },
        keyboard : {
          'type' : 'buttons',
          'buttons' : ['button1', 'button2']
        }
      }
      break;

    default:
    response = {
      'message' : {
        'text' : '다시 입력해주세요.'
      }
    }
      break;
  }


})

module.exports = router;
