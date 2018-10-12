require('date-utils');
require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var fcmModule = require('../util/fcmModule');
var responseUtil = require('../util/responseUtil');
var sortModule = require('../util/communitySortModule');

var mysql = require('mysql');
var conn = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});
conn.connect();

/*
* 자유 게시판 댓글 작성
*/
router.post('/comment', function(req, res){
  var articleNo = req.body.articleNo;
  var writer_id = req.body.writer_id;
  var boardType = req.body.boardType;
  var comment = req.body.comment;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
  var tableNameOfComment = sortModule.sortTableNameOfComment(boardType);
  var tableNameOfArticle = sortModule.sortTableNameOfArticle(boardType);

  var sql = 'INSERT INTO '+tableNameOfComment+' (article_no, writer_id, comment, created_at) VALUES(?,?,?,?)';
  conn.query(sql, [articleNo, writer_id, comment, currentTime], function(err, result, fields){
    if(err){
      console.log(err);
      res.json(responseUtil.successFalse(500, 'Internal Server Error'));
    }else{
      var sql = 'UPDATE '+tableNameOfArticle+' SET comment_cnt = comment_cnt +1 WHERE no=?';
      conn.query(sql, [articleNo], function(err, result, fields){
        res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrue('Success'));
      })

      var sql = 'SELECT a.fcm_token, b.no, b.board_type FROM users AS a JOIN '+tableNameOfArticle+' AS b ON(a.uid = b.writer_id) WHERE b.no=?';
      conn.query(sql, [articleNo], function(err, result, fields){
        if(err){
          console.log(err);
        }else{
          console.log(result[0].no+" articleNo");
          fcmModule.sendPushMyCommunityArticleByComment(result[0].fcm_token, result[0].no, result[0].board_type);
        }
      })
    }
  })
})

/*
* 자유 게시판 댓글 리스트
*/
router.get('/commentList/:boardType/:articleNo/:commentNo', function(req, res){
  var boardType = req.params.boardType;
  var commentNo = req.params.commentNo;
  var articleNo = req.params.articleNo;

  var tableNameOfComment = sortModule.sortTableNameOfComment(boardType);

  var offsetSql = (commentNo == 0) ? '' : 'AND a.created_at > (SELECT created_at FROM '+tableNameOfComment+' WHERE no=?)';

  var sql = 'SELECT a.no, a.article_no, a.writer_id, a.comment, a.blocked, a.created_at, b.nick_name, b.profile, '+
  'b.profile_thumb FROM '+tableNameOfComment+' AS a JOIN users AS b ON(a.writer_id = b.uid) WHERE a.article_no=? '+offsetSql+' ORDER BY '+
  'a.created_at ASC LIMIT 10';
  conn.query(sql, [articleNo, commentNo], function(err, result, fields){
    if(err){
      console.log(err);
    }
    res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrueWithData(result));
  })
})

/*
* 댓글 삭제
*/
router.delete('/delete/:boardType/:no/:articleNo', function(req, res){
  var boardType = req.params.boardType;
  var no = req.params.no;
  var articleNo = req.params.articleNo;
  var tableNameOfComment = sortModule.sortTableNameOfComment(boardType);
  var tableNameOfArticle = sortModule.sortTableNameOfArticle(boardType);

  var sql = 'DELETE FROM '+tableNameOfComment+' WHERE no=?';
  conn.query(sql, [no], function(err, result, fields){
    if(err){
      res.json(responseUtil.successFalse(500, 'Internal Server Error'));
    }else{
      //댓글 delete 성공 후 해당 게시글 Table에서 comment_Cnt를 -1 업데이트해준다.
      var sql = 'UPDATE '+tableNameOfArticle+' SET comment_cnt = comment_cnt -1 WHERE no=?';
      conn.query(sql, [articleNo], function(err, result, fields){
        res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrue('Success'));
      })
    }
  })
})

module.exports = router;
