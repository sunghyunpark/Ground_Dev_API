require('date-utils');
require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var router = express.Router();
var sortModule = require('../util/sortModule');
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
* [게시글 상세 화면에서 댓글 입력]
* 게시글 화면에서 코멘트 Insert
* 댓글 insert 후 해당 게시글의 comment_cnt를 +1 해주며 업데이트한다.
* boardType이 match인 경우에는 최종적으로 MBoard에서도 comment_cnt를 업데이트해준다.
*/
router.post('/view/comment', function(req, res){
  var areaNo = req.body.areaNo;
  var articleNo = req.body.articleNo;
  var writer_id = req.body.writer_id;
  var comment = req.body.comment;
  var boardType = req.body.boardType;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
  var areaName = sortModule.sortAreaName(boardType, areaNo);
  var tableNameOfComment = sortModule.sortTableNameOfComment(boardType);
  var tableNameOfArticle = sortModule.sortTableNameOfArticle(boardType, areaNo);

  // 분기처리된 Table에 댓글을 insert 한다.
  var sql = 'INSERT INTO '+tableNameOfComment+' (article_no, area_name, writer_id, comment, created_at) VALUES(?,?,?,?,?)';
  conn.query(sql, [articleNo, areaName, writer_id, comment, currentTime], function(err, result, fields){
    if(err){
      console.log(err);
      res.json({
        code : 500,
        message : 'Internal Server Error'
      });
    }else{
      //댓글 insert 성공 후 해당 게시글 Table에서 comment_Cnt를 +1 업데이트해준다.
      var sql = 'UPDATE '+tableNameOfArticle+' SET comment_cnt = comment_cnt +1 WHERE no=?';
      conn.query(sql, [articleNo], function(err, result, fields){
        if(err){
          console.log(err);
          res.json(responseUtil.successFalse(500, 'Internal Server Error'));
        }else{
          //boardType이 match인 경우 MBoard내에서도 comnment_cnt를 업데이트해준다.
          if(boardType == 'match'){
          var sql = 'UPDATE MBoard SET comment_cnt = comment_cnt +1 WHERE no=?';
          conn.query(sql, [articleNo], function(err, result, fields){
            res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrue('Success'));
          })
        }else{
          //boardType이 match가 아닌 경우
          res.json(responseUtil.successTrue('Success'));
        }
        }
      })
    }
  })

  var tableNameOfCommnetArticle;
  if(boardType == 'match'){
    tableNameOfCommnetArticle = 'MBoard';
  }else if(boardType == 'hire'){
    tableNameOfCommnetArticle = 'HBoard';
  }else{
    tableNameOfCommnetArticle = 'RBoard';
  }
  var sql = 'SELECT a.fcm_token, b.no, b.area_no, b.board_type FROM users AS a JOIN '+tableNameOfCommnetArticle+' AS b ON(a.uid = b.writer_id) WHERE b.no=?';
  conn.query(sql, [articleNo], function(err, result, fields){
    if(err){
      console.log(err);
    }else{
      fcmModule.sendPushMyArticleByComment(result[0].fcm_token, result[0].no, result[0].area_no, result[0].board_type);
    }
  })

})

/*
* [댓글 리스트]
* 댓글 리스트를 내려준다.
*/
router.get('/:boardType/view/:articleNo/:areaNo/commentList/:commentNo', function(req, res){
  var boardType = req.params.boardType;
  var commentNo = req.params.commentNo;
  var articleNo = req.params.articleNo;
  var areaNo = req.params.areaNo;
  var areaName = sortModule.sortAreaName(boardType, areaNo);    // 게시글의 지역 HBoard, RBoard에서는 빈값으로 들어간다.
  var tableNameOfComment = sortModule.sortTableNameOfComment(boardType);
  var offsetSql = (commentNo == 0) ? '' : 'AND a.created_at > (SELECT created_at FROM '+tableNameOfComment+' WHERE no=?)';

    if(boardType == 'match'){
      var sql = 'SELECT a.no, a.article_no, a.area_name, a.writer_id, a.comment, a.blocked, a.created_at, b.nick_name, b.profile, b.profile_thumb FROM '+tableNameOfComment+
      ' AS a JOIN users AS b ON(a.writer_id = b.uid) WHERE a.article_no=? AND a.area_name=? '+offsetSql+' ORDER BY a.created_at ASC LIMIT 10';
      conn.query(sql, [articleNo, areaName, commentNo], function(err, result, fields){
        res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrueWithData(result));
      })

    }else{
      var sql = 'SELECT a.no, a.article_no, a.area_name, a.writer_id, a.comment, a.blocked, a.created_at, b.nick_name, b.profile, b.profile_thumb FROM '+tableNameOfComment+
      ' AS a JOIN users AS b ON(a.writer_id = b.uid) WHERE a.article_no=? '+offsetSql+' ORDER BY a.created_at ASC LIMIT 10';
      conn.query(sql, [articleNo, commentNo], function(err, result, fields){
        res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrueWithData(result));
      })

    }
})

/*
* 댓글 삭제
*/
router.delete('/view/comment/delete/:boardType/:no/:articleNo/:areaNo', function(req, res){
  var boardType = req.params.boardType;
  var no = req.params.no;
  var articleNo = req.params.articleNo;
  var areaNo = req.params.areaNo;
  var tableNameOfComment = sortModule.sortTableNameOfComment(boardType);
  var tableNameOfArticle = sortModule.sortTableNameOfArticle(boardType, areaNo);

  var sql = 'DELETE FROM '+tableNameOfComment+' WHERE no=?';
  conn.query(sql, [no], function(err, result, fields){
    if(err){
      res.json(responseUtil.successFalse(500, 'Internal Server Error'));
    }else{
      //댓글 delete 성공 후 해당 게시글 Table에서 comment_Cnt를 -1 업데이트해준다.
      var sql = 'UPDATE '+tableNameOfArticle+' SET comment_cnt = comment_cnt -1 WHERE no=?';
      conn.query(sql, [articleNo], function(err, result, fields){
        if(err){
          console.log(err);
          res.json(responseUtil.successFalse(500, 'Internal Server Error'));
        }else{
          //boardType이 match인 경우 MBoard내에서도 comnment_cnt를 업데이트해준다.
          if(boardType == 'match'){
          var sql = 'UPDATE MBoard SET comment_cnt = comment_cnt -1 WHERE no=?';
          conn.query(sql, [articleNo], function(err, result, fields){
            res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrue('Success'));
          })
        }else{
          //boardType이 match가 아닌 경우
          res.json(responseUtil.successTrue('Success'));
        }
        }
      })
    }
  })
})

module.exports = router;
