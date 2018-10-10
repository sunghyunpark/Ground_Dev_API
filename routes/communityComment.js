require('date-utils');
require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var fcmModule = require('../util/fcmModule');
var responseUtil = require('../util/responseUtil');

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
router.post('/free/comment', function(req, res){
  var articleNo = req.body.articleNo;
  var writer_id = req.body.writer_id;
  var comment = req.body.comment;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');

  var sql = 'INSERT INTO FComment (article_no, writer_id, comment, created_at) VALUES(?,?,?,?)';
  conn.query(sql, [articleNo, writer_id, comment, currentTime], function(err, result, fields){
    if(err){
      console.log(err);
      res.json(responseUtil.successFalse(500, 'Internal Server Error'));
    }else{
      var sql = 'UPDATE FBoard SET comment_cnt = comment_cnt +1 WHERE no=?';
      conn.query(sql, [articleNo], function(err, result, fields){
        res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrue('Success'));
      })
    }
  })
})

/*
* 자유 게시판 댓글 리스트
*/
router.get('/free/commentList/:articleNo/:commentNo', function(req, res){
  var commentNo = req.params.commentNo;
  var articleNo = req.params.articleNo;

  var offsetSql = (commentNo == 0) ? '' : 'AND a.created_at > (SELECT created_at FROM FComment WHERE no=?)';

  var sql = 'SELECT a.no, a.articleNo, a.writer_id, a.comment, a.blocked, a.created_at, b.nick_name, b.profile, '+
  'b.profile_thumb FROM FComment AS a JOIN users AS b ON(a.writer_id = b.uid) WHERE a.article_no=? '+offsetSql+' ORDER BY '+
  'a.created_at ASC LIMIT 10';
  conn.query(sql, [articleNo, commentNo], function(err, result, fields){
    if(err){
      console.log(err);
    }
    res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrueWithData(result));
  })
})

module.exports = router;
