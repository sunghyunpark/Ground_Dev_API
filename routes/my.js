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

/*
* 내가 쓴 글 match / hire / recruit
*/
router.get('/article/:boardType/:uid/:no', function(req, res){
  var boardType = req.params.boardType;
  var uid = req.params.uid;
  var no = req.params.no;
  var tableName;

  if(boardType == 'match'){
    tableName = 'MBoard';
  }else if(boardType == 'hire'){
    tableName = 'HBoard';
  }else if(boardType == 'recruit'){
    tableName = 'RBoard';
  }

  var offsetSql = 'AND a.created_at < (SELECT created_at FROM '+tableName+' WHERE no=?)';
  if(no == 0){
    offsetSql = '';
  }
  var sql = 'SELECT a.no, a.board_type, a.area_no, a.writer_id, a.title, a.contents, a.blocked, a.view_cnt, a.comment_cnt, a.created_at, b.nick_name FROM '+
  tableName+' AS a JOIN users AS b ON(a.writer_id=b.uid) WHERE a.writer_id=? '+offsetSql+' ORDER BY a.created_at DESC LIMIT 10';

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
  var tableName;
  var boardTableName;

  if(boardType == 'match'){
    tableName = 'MComment';
    boardTableName = 'MBoard';
  }else if(boardType == 'hire'){
    tableName = 'HComment';
    boardTableName = 'HBoard';
  }else if(boardType == 'recruit'){
    tableName = 'RComment';
    boardTableName = 'RBoard';
  }

  var offsetSql = 'AND a.created_at < (SELECT created_at FROM '+tableName+' WHERE no=?)';
  if(no == 0){
    offsetSql = '';
  }
  var sql = 'SELECT a.no, a.article_no, a.area_name, a.writer_id, a.comment, a.blocked, a.created_at, b.nick_name, b.profile, b.profile_thumb, c.area_no, c.board_type FROM '+tableName+
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
router.get('/favorite/:boardType/:uid/:areaNo/:no', function(req, res){
  var boardType = req.params.boardType;
  var uid = req.params.uid;
  var areaNo = req.params.areaNo;
  var no = req.params.no;
  var tableName;
  var tableNameOfBoard;

  if(boardType == 'match'){
    if(areaNo < 9){
      //Seoul
      tableNameOfBoard = 'MBoard_Seoul';
    }else if(areaNo > 9){
      //Gyeonggi
      tableNameOfBoard = 'MBoard_Gyeonggi';
    }
    tableName = 'MBFavorite';
  }else if(boardType == 'hire'){
    tableName = 'HBFavorite';
  }else if(boardType == 'recruit'){
    tableName = 'RBFavorite';
  }

  var offsetSql = 'AND a.created_at < (SELECT created_at FROM '+tableName+' WHERE no=?)';
  if(no == 0){
    offsetSql = '';
  }
  var sql = 'SELECT a.article_no, b.board_type, b.area_no, b.writer_id, b.title, b.contents, b.blocked, b.view_cnt, b.comment_cnt, b.created_at, c.nick_name FROM '+
  tableName+' AS a JOIN '+tableNameOfBoard+' AS b ON(b.no=a.article_no) JOIN users AS c ON(c.writer_id=b.uid) WHERE a.uid=? '+offsetSql+' ORDER BY a.created_at DESC LIMIT 10';

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