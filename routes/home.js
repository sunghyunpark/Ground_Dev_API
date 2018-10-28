require('date-utils');
require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var router = express.Router();
var sortModule = require('../util/matchSortModule');

var mysql = require('mysql');
var conn = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});
conn.connect();

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
    matchData = 'article.match_date AS matchDate, article.average_age AS averageAge,'
  }else if(boardType == 'hire'){
    tableName = 'HBoard';
  }else if(boardType == 'recruit'){
    tableName = 'RBoard';
  }
  var offsetSql = (articleNo == 0) ? '' : ' WHERE article.created_at < (SELECT created_at FROM '+tableName+' WHERE no=?)';

  var sql = 'SELECT article.no, '+
  'article.board_type AS matchBoardType, '+
  'article.area_no AS areaNo, '+
  'article.writer_id AS writerId, '+
  'article.title, '+
  'article.contents, '+
  'article.match_state AS matchState, '+
  'article.blocked, '+
  'article.view_cnt AS viewCnt, '+
  'article.comment_cnt AS commentCnt, '+
  matchData+' article.created_at AS createdAt, '+
  'users.nick_name AS nickName, '+
  'users.profile, '+
  'users.profile_thumb AS profileThumb '+
  'FROM '+ tableName + ' AS article JOIN users AS users ON(article.writer_id=users.uid) '+
  offsetSql+' ORDER BY article.created_at DESC LIMIT ' + limit;

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
  var offsetSql = (articleNo == 0) ? '' : 'AND article.created_at < (SELECT created_at FROM MBoard WHERE no=?)';

  var sql = 'SELECT article.no, '+
  'article.board_type AS matchBoardType, '+
  'article.area_no AS areaNo, '+
  'article.writer_id AS writerId, '+
  'article.title, '+
  'article.contents, '+
  'article.match_state AS matchState, '+
  'article.blocked, '+
  'article.view_cnt AS viewCnt, '+
  'article.comment_cnt AS commentCnt, '+
  'article.match_date AS matchDate, '+
  'article.average_age AS averageAge, '+
  'article.created_at AS createdAt, '+
  'users.nick_name AS nickName, '+
  'users.profile, '+
  'users.profile_thumb AS profileThumb '+
  'FROM MBoard AS article JOIN users AS users ON(article.writer_id=users.uid) '+
  'WHERE article.match_date=? ' + offsetSql +
  ' ORDER BY article.created_at DESC LIMIT ' + limit;

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
