require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var router = express.Router();
var sortModule = require('../util/matchSortModule');
var responseUtil = require('../util/responseUtil');

var conn = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});
conn.connect();

router.get('/matchArticle/:no/:areaNoStr/:order/:matchDate',function(req, res){
  var no = req.params.no;
  var areaNoArray = req.params.areaNoStr.split(',');
  var order = req.params.order;
  var matchDate = req.params.matchDate;
  var offsetSql = (no == 0) ? '' : ' AND article.created_at < (SELECT created_at FROM MBoard WHERE no='+no+')';
  var whereSql1 = 'where (area_no=?';
  var whereSql2 = '';

  if(areaNoArray.length > 1){
    for(var i=0;i<areaNoArray.length-1;i++){
      if(i == areaNoArray.length-2){
        whereSql2 += ' or area_no=?)';
      }else{
        whereSql2 += ' or area_no=?';
      }
    }
  }else{
    whereSql2 = ')';
  }

  whereSql1 += whereSql2;

  if(order == 'all'){
    orderData = '';
  }else if(order == 'matchDate'){
    orderData = ' AND article.match_date=?';
    areaNoArray.push(matchDate);
  }else if(order == 'matchState'){
    orderData = ' AND article.match_state=\'N\'';
  }

  areaNoArray.push(no);

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
  'article.charge, '+
  'article.play_rule AS playRule, '+
  'article.created_at AS createdAt, '+
  'users.nick_name AS nickName, '+
  'users.profile, '+
  'users.profile_thumb AS profileThumb FROM MBoard AS article '+
  'JOIN users AS users ON(article.writer_id=users.uid) ' + whereSql1 + orderData + offsetSql + ' ORDER BY article.created_at DESC LIMIT 10';

  conn.query(sql, areaNoArray, function(err, result, fields){
    if(err){
      console.log(err);
    }else{
      res.json(responseUtil.successTrueWithData(result));
    }
  })
})


module.exports = router;
