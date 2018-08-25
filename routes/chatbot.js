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

var areaArray = ['서울', '도봉/노원/강북/중랑', '성북/동대문/종로', '은평/서대문/마포', '용산/중구',
'성동/광진/강동', '송파/서초/강남', '양천/구로/영등포/강서', '금천/관악/동작', '경기', '고양',
'인천/부천/김포', '구리/남양주/하남', '시흥/안산/광명', '과천/안양/군포/의왕',
'수원/용인/화성/오산', '파주', '성남/광주/이천', '평택/안성', '의정부/양주/그 외'];

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
  var responseText = '';

  if(msg == '오늘의 시합'){
    var todayDate = new Date().toFormat('YYYY-MM-DD');
    var sql = 'SELECT title, area_no FROM MBoard WHERE match_date=? ORDER BY created_at DESC';

    conn.query(sql, [todayDate], function(err, result, fields){
      if(err){
        responseText = err;
      }else{
        for(var i=0;i<result.length;i++){
          console.log(result[i].area_no);
          console.log(areaArray[result[i].area_no]);
          responseText += (i+1)+'. ['+areaArray[result[i].area_no]+'] '+result[i].title + '\n';
        }
        console.log('log'+responseText);
        response = {
          'message' : {
            'text' : responseText
          },
          keyboard : {
            'type' : 'buttons',
            'buttons' : ['오늘의 시합', '최신글 보기']
          }
        }

        res.set({
              'content-type': 'application/json'
          }).send(JSON.stringify(response));
      }
    });
  }

/*
  switch (msg) {

    case '오늘의 시합':
    var todayDate = new Date().toFormat('YYYY-MM-DD');
    var sql = 'SELECT title FROM MBoard WHERE match_date=? ORDER BY created_at DESC';

    conn.query(sql, [todayDate], function(err, result, fields){
      if(err){
        responseText = err;
      }else{
        for(var i=0;i<result.length;i++){
          responseText += result[i].title;
        }
        console.log('log'+responseText);
        response = {
          'message' : {
            'text' : responseText
          },
          keyboard : {
            'type' : 'buttons',
            'buttons' : ['오늘의 시합', '최신글 보기']
          }
        }
        return;
      }
    })
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
    */
})


module.exports = router;
