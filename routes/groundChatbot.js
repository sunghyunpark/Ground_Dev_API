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

router.get('/kakao/keyboard', function(req, res){
  var data = {
    'type' : 'buttons',
    'buttons' : ['오늘의 용병']
  };
  res.set({
      'content-type': 'application/json'
  }).send(JSON.stringify(data));
})


router.post('/kakao/message', function(req, res){
  var msg = req.body.content;
  var type = req.body.type;
  var response = {};
  var responseText = '안녕하세요. \n풋볼그라운드입니다.\n';

  if(msg == '오늘의 용병'){
    var todayDate = new Date().toFormat('YYYY-MM-DD');
    responseText += todayDate+' 기준 오늘의 용병 게시글입니다.\n';
    var sql = 'SELECT title, match_date, charge, play_rule, article_url FROM ChatbotBoard WHERE match_date=? ORDER BY created_at DESC';

    conn.query(sql, [todayDate], function(err, result, fields){
      if(err){
        responseText = err;
      }else{
        var playRuleStr;
        for(var i=0;i<result.length;i++){
          if(result[i].play_rule == 0){
            playRuleStr = '기타';
          }else{
            playRuleStr = result[i].play_rule + ' VS ' + result[i].play_rule;
          }
          responseText += (i+1)+'.'+result[i].title + '\n'+
          '- 시합 날짜 : ' + result[i].match_date + '\n'+
          '- 구장비 : ' + result[i].charge + '원\n' +
          '- 경기 방식 : ' + playRuleStr + '\n' +
          '- URL : ' + result[i].article_url + '\n\n';
        }
        response = {
          'message' : {
            'text' : responseText
          },
          keyboard : {
            'type' : 'buttons',
            'buttons' : ['오늘의 용병']
          }
        }

        res.set({
              'content-type': 'application/json'
          }).send(JSON.stringify(response));
      }
    });
  }
})


module.exports = router;
