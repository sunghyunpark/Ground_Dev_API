require('date-utils');
require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var multer = require('multer');
var responseUtil = require('../util/responseUtil');

var mysql = require('mysql');
var conn = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});
conn.connect();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/board/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({storage: storage});

/*
* 자유 게시판 글쓰기
*/
router.post('/free', upload.single('photo'), function(req, res){
  var uid = req.body.uid;
  var title = req.body.title;
  var contents = req.body.contents;
  var photo = 'upload/board/'+req.file.filename;
  var photoThumb = 'N';
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');

  var sql = 'INSERT INTO FBoard (writer_id, title, contents, photo, photo_thumb, created_at) VALUES(?,?,?,?,?,?)';
  conn.query(sql, [uid, title, contents, photo, photoThumb, currentTime], function(err, result, fields){
    res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrue('Success'));
  })
})

/*
* 자유 게시글 List 받기
*/
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

/*
* 자유게시판 좋아요 상태
*/
router.get('/free/detailView/favorite/:no/:uid', function(req, res){
  var no = req.params.no;
  var uid = req.params.uid;

  var sql = 'UPDATE FBoard SET view_cnt = view_cnt +1 WHERE no=?';
  conn.query(sql, [no], function(err, result, fields){
    if(err){
      res.json(responseUtil.successFalse(500, 'Internal Server Error'));
    }else{
      var sql = 'SELECT EXISTS (SELECT * FROM FBFavorite WHERE article_no=? AND uid=?) AS favoriteState';
      conn.query(sql, [no, uid], function(err, result, fields){
        if(err){
          res.json(responseUtil.successFalse(500, 'Internal Server Error'));
        }else{
          res.json({
            code : 200,
            message : 'Success',
            favoriteState : result[0].favoriteState
          });
        }
      })
    }
  })
})

/*
* 자유 게시판 좋아요
*/

router.post('/free/favorite', function(req, res){
  var favoriteState = req.body.favoriteState;
  var articleNo = req.body.articleNo;
  var uid = req.body.uid;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');

  if(favoriteState == 'Y'){
    var sql = 'INSERT INTO FBFavorite (article_no, uid, created_at) VALUES(?,?,?)';
    conn.query(sql, [articleNo, uid, currentTime], function(err, result, fields){
      res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrue());
    })
  }else {
    var sql = 'DELETE FROM FBFavorite WHERE uid =? AND article_no=?';
    conn.query(sql, [uid, articleNo], function(err, result, fields){
      res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrue());
    })
  }
})

/*
* 자유게시판 최근 업데이트 시간
*/
router.get('/free/updated', function(req, res){
  var sql = 'SELECT created_at FROM FBoard ORDER BY created_at DESC limit 1';
  conn.query(sql, function(err, result, fields){
    if(err){
      console.log(err);
    }
    res.json(err ? responseUtil.successFalse(500, 'Internal Server Error111') : responseUtil.successTrueWithData(result));
  })
})

module.exports = router;
