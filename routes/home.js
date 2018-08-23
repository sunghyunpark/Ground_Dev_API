require('date-utils');
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var router = express.Router();
var sortModule = require('./module.js');

var mysql = require('mysql');
var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'qkr103838!@',
  database : 'ground_dev'
});
conn.connect();

/*
* 오늘의 시합
*/
router.get('/today/:no/:limit', function(req, res){
  console.log('today api');
  var articleNo = req.params.no;
  var limit = req.params.limit;
  var todayDate = new Date().toFormat('YYYY-MM-DD');
  var offsetSql;
  if(articleNo == 0){
    offsetSql = '';
  }else{
    offsetSql = 'AND a.created_at < (SELECT created_at FROM MBoard WHERE no=?)';
  }

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
