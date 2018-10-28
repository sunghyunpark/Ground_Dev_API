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
* 내가 쓴 글 match / hire / recruit
*/
router.get('/article/:boardType/:uid/:no', function(req, res){
  var boardType = req.params.boardType;
  var uid = req.params.uid;
  var no = req.params.no;
  var tableName;
  var matchData = '';

  if(boardType == 'match'){
    tableName = 'MBoard';
    matchData = 'article.match_date AS matchDate, article.average_age AS averageAge,'
  }else if(boardType == 'hire'){
    tableName = 'HBoard';
  }else if(boardType == 'recruit'){
    tableName = 'RBoard';
  }

  var offsetSql = 'AND article.created_at < (SELECT created_at FROM '+tableName+' WHERE no=?)';
  if(no == 0){
    offsetSql = '';
  }
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
  matchData + 'article.created_at AS createdAt, '+
  'users.nick_name AS nickName FROM '+
  tableName+' AS article JOIN users AS users ON(article.writer_id=users.uid) WHERE article.writer_id=? '+offsetSql+' ORDER BY article.created_at DESC LIMIT 10';

  conn.query(sql, [uid, no], function(err, result, fields){
    if(err){
      console.log(err);
      res.json({
        code : 500,
        message : 'Internal Server Error'
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
* 내가 쓴 댓글 match / hire / recruit
*/
router.get('/comment/:boardType/:uid/:no', function(req, res){
  var boardType = req.params.boardType;
  var uid = req.params.uid;
  var no = req.params.no;
  var tableNameOfComment = sortModule.sortTableNameOfComment(boardType);
  var boardTableName;

  if(boardType == 'match'){
    boardTableName = 'MBoard';
  }else if(boardType == 'hire'){
    boardTableName = 'HBoard';
  }else if(boardType == 'recruit'){
    boardTableName = 'RBoard';
  }

  var offsetSql = 'AND a.created_at < (SELECT created_at FROM '+tableNameOfComment+' WHERE no=?)';
  if(no == 0){
    offsetSql = '';
  }
  var sql = 'SELECT a.no, a.article_no, a.area_name, a.writer_id, a.comment, a.blocked, a.created_at, b.nick_name, b.profile, b.profile_thumb, c.area_no, c.board_type FROM '+tableNameOfComment+
  ' AS a JOIN users AS b ON(a.writer_id = b.uid) JOIN '+boardTableName+' AS c ON(a.article_no = c.no) WHERE a.writer_id=? '+offsetSql+' ORDER BY a.created_at DESC LIMIT 10';

  conn.query(sql, [uid, no], function(err, result, fields){
    if(err){
      console.log(err);
      res.json({
        code : 500,
        message : 'Internal Server Error'
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
* 관심있는 글 리스트 match / hire / recruit
*/
router.get('/favorite/:boardType/:uid/:no', function(req, res){
  var boardType = req.params.boardType;
  var uid = req.params.uid;
  var no = req.params.no;
  var tableNameOfFavorite = sortModule.sortTableNameOfFavorite(boardType);
  var tableNameOfBoard;

  if(boardType == 'match'){
    tableNameOfBoard = 'MBoard';
  }else if(boardType == 'hire'){
    tableNameOfBoard = 'HBoard';
  }else if(boardType == 'recruit'){
    tableNameOfBoard = 'RBoard';
  }

  var offsetSql = 'AND a.created_at < (SELECT created_at FROM '+tableNameOfFavorite+' WHERE no=?)';
  if(no == 0){
    offsetSql = '';
  }
  var sql = 'SELECT favoriteArticle.article_no AS no, '+
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
  'users.nick_name AS nickName FROM '+
  tableNameOfFavorite+' AS favoriteArticle JOIN '+tableNameOfBoard +
  ' AS article ON(article.no=favoriteArticle.article_no) JOIN users AS users ON(article.writer_id=users.uid) WHERE favoriteArticle.uid=? '+
  offsetSql+' ORDER BY favoriteArticle.created_at DESC LIMIT 10';

  conn.query(sql, [uid, no], function(err, result, fields){
    if(err){
      console.log(err);
      res.json({
        code : 500,
        message : 'Internal Server Error'
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
