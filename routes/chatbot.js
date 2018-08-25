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
    'buttons' : ['오늘의 시합', '최신글 보기']
  };
  res.set({
      'content-type': 'application/json'
  }).send(JSON.stringify(data));
})


router.post('/kakao/message', function(req, res){
  var msg = req.body.content;
  console.log('전달받은 메시지 : ' + msg);
  var type = req.body.type;
  console.log('전달받은 타입 : ' + type);
  var response = {};

  switch (msg) {

    case '오늘의 시합':
    var responseText = '';
    var todayDate = new Date().toFormat('YYYY-MM-DD');
    var sql = 'SELECT title FROM MBoard WHERE match_date=? ORDER BY created_at DESC';

    conn.query(sql, [todayDate], function(err, result, fields){
      if(err){
        responseText = err;
      }else{
        for(var i=0;i<result.length;i++){
          responseText += result[i].title;
        }
        console.log(responseText);
        response = {
          'message' : {
            'text' : responseText
          },
          keyboard : {
            'type' : 'buttons',
            'buttons' : ['오늘의 시합', '최신글 보기']
          }
      }
    })
/*
    response = {
      'message' : {
        'text' : responseText
      },
      keyboard : {
        'type' : 'buttons',
        'buttons' : ['오늘의 시합', '최신글 보기']
      }
    }*/
      break;

      case '최신글 보기':
      response = {
        'message' : {
          'text' : '최신글 보기 선택'
        },
        keyboard : {
          'type' : 'buttons',
          'buttons' : ['오늘의 시합', '최신글 보기']
        }
      }
      break;

    default:
    response = {
      'message' : {
        'text' : '다시 선택해주세요.'
      }
    }
      break;
  }
  res.set({
        'content-type': 'application/json'
    }).send(JSON.stringify(response));
})


module.exports = router;
