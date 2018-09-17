require('date-utils');
require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var router = express.Router();
var sortModule = require('../util/sortModule');

var mysql = require('mysql');
var conn = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});
conn.connect();

router.get('/ad/banner', function(req, res){
  res.json({
    code : 200,
    message : 'Success',
    result : [
      {
        bannerImg : 'static/banner/banner_test_1.png',
        bannerUrl : 'naver.com'
      },
      {
        bannerImg : 'static/banner/banner_test_2.png',
        bannerUrl : 'daum.net'
      }
    ]
  });
});

/*
* 최신글 리스트를 5개씩 내려준다.(match / hire / recruit)
*/
router.get('/recent/:boardType/:no/:limit', function(req, res){
  var boardType = req.params.boardType;
  var articleNo = req.params.no;
  var tableName;
  var limit = req.params.limit;
  var matchData = '';

  if(boardType == 'match'){
    tableName = 'MBoard';
    matchData = 'a.match_date, a.average_age,'
  }else if(boardType == 'hire'){
    tableName = 'HBoard';
  }else if(boardType == 'recruit'){
    tableName = 'RBoard';
  }
  var offsetSql = (articleNo == 0) ? '' : ' WHERE a.created_at < (SELECT created_at FROM '+tableName+' WHERE no=?)';

  var sql = 'SELECT a.no, a.board_type, a.area_no, a.writer_id, a.title, a.contents, a.match_state, a.blocked, a.view_cnt, a.comment_cnt, '+matchData+
  ' a.created_at, b.nick_name, b.profile, b.profile_thumb FROM '+
  tableName+' AS a JOIN users AS b ON(a.writer_id=b.uid)'+offsetSql+' ORDER BY a.created_at DESC LIMIT '+limit;
  conn.query(sql, [articleNo], function(err, result, fields){
    if(err){
      console.log(err);
      res.json({
        code : 500,
        message : 'Internal Server Error Recent'
      });
    }else{
      res.json({
        code : 200,
        message : 'Success',
        result : result
      });
    }
  })
})

/*
* 오늘의 시합
*/
router.get('/today/:no/:limit', function(req, res){
  var articleNo = req.params.no;
  var limit = req.params.limit;
  var todayDate = new Date().toFormat('YYYY-MM-DD');
  var offsetSql = (articleNo == 0) ? '' : 'AND a.created_at < (SELECT created_at FROM MBoard WHERE no=?)';

  var sql = 'SELECT a.*, b.nick_name, b.profile, b.profile_thumb FROM MBoard AS a JOIN users AS b ON(a.writer_id=b.uid) WHERE a.match_date=? '+
  offsetSql+' ORDER BY a.created_at DESC LIMIT '+limit;
  conn.query(sql, [todayDate, articleNo], function(err, result, fields){
    if(err){
      console.log(err);
      res.json({
        code : 500,
        message : 'Internal Server Error Recent'
      });
    }else{
      res.json({
        code : 200,
        message : 'Success',
        result : result
      });
    }
  })

})

module.exports = router;
