require('date-utils');
require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var router = express.Router();
var responseUtil = require('../util/responseUtil');

var conn = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});
conn.connect();

router.post('/sayHello', function(req, res) {
  
  var responseText = '안녕하세요. \nGROUND-그라운드입니다.\n';
  var todayDate = new Date().toFormat('YYYY-MM-DD');
  var sql = 'SELECT title, area_no, match_state, match_date, charge, play_rule FROM MBoard WHERE match_date=? ORDER BY created_at DESC';
  responseText += todayDate+' 기준 오늘의 시합 게시글입니다.\n';

  conn.query(sql, [todayDate], function(err, result, fields){
        if(err){
          console.log(err);
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
            responseText += (i+1)+'. ['+matchAreaArray[result[i].area_no]+']\n' +
            '매칭 상태 : ' + matchState +'\n'+
            '제목 : ' + result[i].title + '\n'+
            '시합 날짜 : ' + result[i].match_date + '\n'+
            '구장비 : ' + result[i].charge + '원\n' +
            '경기 방식 : ' + playRuleStr;
          }
          const responseBody = {
            version: "2.0",
            template: {
              outputs: [
                {
                  simpleText: {
                    text: responseText
                  }
                }
              ]
            }
          };

          res.status(200).send(responseBody);
        }
      });

});

router.post('/showHello', function(req, res) {
  console.log(req.body);

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleImage: {
            imageUrl: "https://t1.daumcdn.net/friends/prod/category/M001_friends_ryan2.jpg",
            altText: "hello I'm Ryan"
          }
        }
      ]
    }
  };

  res.status(200).send(responseBody);
});


module.exports = router;
