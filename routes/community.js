require('date-utils');
require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var router = express.Router();
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
* 자유 게시판 글쓰기
*/
router.post('/free', function(req, res){
  var uid = req.body.uid;
  var title = req.body.title;
  var contents = req.body.contents;
  var photo = req.body.photo;
  var photoThumb = req.body.photoThumb;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');

  var sql = 'INSERT INTO FBoard (writer_id, title, contents, photo, photo_thumb, created_at) VALUES(?,?,?,?,?,?)';
  conn.query(sql, [uid, title, contents, photo, photoThumb, currentTime], function(err, result, fields){
    res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrue('Success'));
  })
})

router.get('/free/:no', function(req, res){
  var no = req.params.no;
  var offsetSql = (no == 0) ? '' : 'WHERE a.created_at < (SELECT created_at FROM FBoard WHERE no='+no+')';

  var sql = 'SELECT a.no, a.writer_id, a.title, a.contents, a.photo, a.photo_thumb, a.blocked, a.view_cnt, '+
  'a.comment_cnt, a.created_at, b.nick_name, b.profile, b.profile_thumb FROM FBoard AS a JOIN users AS b ON(a.writer_id=b.uid) '
  +offsetSql+' ORDER BY a.created_at DESC LIMIT 10';

  conn.query(sql, [no], function(err, result, fields){
    res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrueWithData(result));
  })
})

module.exports = router;
