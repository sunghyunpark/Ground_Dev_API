require('date-utils');
require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var router = express.Router();

var mysql = require('mysql');
var conn = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});
conn.connect();

/*
* 신고하기
serviceName -> article / comment
serviceNo -> article의 경우 articleNo, comment의 경우 commentNo
*/
router.post('/report', function(req, res){
  var serviceName = req.body.serviceName;
  var serviceNo = req.body.serviceNo;
  var boardType = req.body.boardType;
  var uid = req.body.uid;
  var contents = req.body.contents;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
  var tableName;

  if(serviceName == 'article'){
    tableName = 'ReportBoard (article_no, ';
  }else{
    tableName = 'ReportComment (comment_no, ';
  }

  var sql = 'INSERT INTO '+tableName+'board_type, reporter_uid, contents, created_at) VALUES(?,?,?,?,?)';
  conn.query(sql, [serviceNo, boardType, uid, contents, currentTime], function(err, result, fields){
    if(err){
      console.log(err);
      res.json({
        code : 500,
        message : 'Internal Server Error'
      });
    }else{
      res.json({
        code : 200,
        message : 'Success'
      });
    }
  })
})

module.exports = router;
