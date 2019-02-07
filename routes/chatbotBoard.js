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

router.post('/', function(req, res){
  var title = req.body.title;
  var contents = req.body.contents;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');

  var sql = 'INSERT INTO chatbot_kakao (title, contents, created_at) VALUES (?,?,?)';

  conn.query(sql, [title, contents, currentTime], function(err, result, fields){
    if(err){
      console.log(err);
    }else{
      res.json({
        error : 'Success Insert Data'
      });
    }
  })
})

router.post('/matchData', function(req, res){
  var resultText = '안녕하세요.\n풋볼그라운드입니다.\n오늘의 용병 모집글 리스트입니다.\n';

  var sql = 'SELECT * FROM chatbot_kakao';
  conn.query(sql, function(err, result, fields){
    if(err){
      console.log(err);
    }else{
      for(var i=0;i<result.length;i++){
        resultText +=
        '\n\n제목 : ' + result[i].title + '\n' +
        '내용 :\n' + result[i].contents + '\n';
      }
      const responseBody = {
        version: "2.0",
        template: {
          outputs: [
            {
              simpleText: {
                text: resultText
              }
            }
          ]
        }
      };

      res.status(200).send(responseBody);
    }
  })
})

router.post('/sayHello', function(req, res) {

  var sql = 'SELECT '

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: "하이이이이이"
          }
        }
      ]
    }
  };

  res.status(200).send(responseBody);

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
