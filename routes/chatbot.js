require('date-utils');
require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var router = express.Router();

var mysql = require('mysql');
var conn = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
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
  var type = req.body.type;
  var response = {};
  var responseText = '안녕하세요. \nGROUND-그라운드입니다.\n';

  if(msg == '오늘의 시합'){
    var todayDate = new Date().toFormat('YYYY-MM-DD');
    responseText += todayDate+' 기준 오늘의 시합 게시글입니다.\n';
    var sql = 'SELECT title, area_no, match_state, match_date, charge, play_rule FROM MBoard WHERE match_date=? ORDER BY created_at DESC';

    conn.query(sql, [todayDate], function(err, result, fields){
      if(err){
        responseText = err;
      }else{
        var matchState;
        var playRuleStr;
        for(var i=0;i<result.length;i++){
          if(result[i].match_state == 'Y'){
            matchState = '매칭완료';
          }else{
            matchState = '진행중';
          }

          if(result[i].play_rule == 0){
            playRuleStr = '기타\n\n';
          }else{
            playRuleStr = result[i].play_rule + ' VS ' + result[i].play_rule + '\n\n';
          }
          responseText += (i+1)+'. ['+areaArray[result[i].area_no]+']\n' +
          '매칭 상태 : ' + matchState +'\n'+
          '제목 : ' + result[i].title + '\n'+
          '시합 날짜 : ' + result[i].match_date + '\n'+
          '구장비 : ' + result[i].charge + '원\n' +
          '경기 방식 : ' + playRuleStr;
        }
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
  }else if(msg == '최신글 보기'){
    response = {
      'message' : {
        'text' : "최신글 보기를 선택하셨습니다.\n각 게시판의 최근 10개 글을 보여줍니다."
      },
      keyboard : {
        'type' : 'buttons',
        'buttons' : ['매칭', '용병', '모집', '뒤로가기']
      }
    }

    res.set({
          'content-type': 'application/json'
      }).send(JSON.stringify(response));

  }else if(msg == '매칭'){
    responseText += '매칭 게시판의 최신글 목록입니다.\n';
    var sql = 'SELECT title, area_no, match_state, match_date, charge, play_rule FROM MBoard ORDER BY created_at DESC LIMIT 10';

    conn.query(sql, function(err, result, fields){
      if(err){
        responseText = err;
      }else{
        var matchState;
        var playRuleStr;
        for(var i=0;i<result.length;i++){
          if(result[i].match_state == 'Y'){
            matchState = '매칭완료';
          }else{
            matchState = '진행중';
          }
          if(result[i].play_rule == 0){
            playRuleStr = '기타\n\n';
          }else{
            playRuleStr = result[i].play_rule + ' VS ' + result[i].play_rule + '\n\n';
          }

          responseText += (i+1)+'. ['+areaArray[result[i].area_no]+']\n' +
          '매칭 상태 : ' + matchState +'\n'+
          '제목 : ' + result[i].title + '\n'+
          '시합 날짜 : ' + result[i].match_date + '\n'+
          '구장비 : ' + result[i].charge + '원\n' +
          '경기 방식 : ' + playRuleStr;
        }
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
  }else if(msg == '용병'){
    responseText += '용병 게시판의 최신글 목록입니다.\n';
    var sql = 'SELECT title, area_no, match_state FROM HBoard ORDER BY created_at DESC LIMIT 10';

    conn.query(sql, function(err, result, fields){
      if(err){
        responseText = err;
      }else{
        for(var i=0;i<result.length;i++){
          responseText += (i+1)+'. ['+areaArray[result[i].area_no]+']\n' +
          '제목 : ' + result[i].title + '\n\n';
        }
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
  }else if(msg == '모집'){
    responseText += '모집 게시판의 최신글 목록입니다.\n';
    var sql = 'SELECT title, area_no, match_state FROM RBoard ORDER BY created_at DESC LIMIT 10';

    conn.query(sql, function(err, result, fields){
      if(err){
        responseText = err;
      }else{
        for(var i=0;i<result.length;i++){
          responseText += (i+1)+'. ['+areaArray[result[i].area_no]+']\n' +
          '제목 : ' + result[i].title + '\n\n';
        }
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
  }else if(msg == '뒤로가기'){
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
})


module.exports = router;
