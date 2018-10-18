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
  var offsetSql = (no == 0) ? '' : ' AND a.created_at < (SELECT created_at FROM MBoard WHERE no='+no+')';
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
    orderData = ' AND a.match_date=?';
    areaNoArray.push(matchDate);
  }else if(order == 'matchState'){
    orderData = ' AND a.match_state=\'N\'';
  }

  areaNoArray.push(no);

  var sql = 'SELECT a.no, a.board_type, a.area_no, a.writer_id, a.title, a.contents, a.match_state, a.blocked, a.view_cnt, '+
  'a.comment_cnt, a.match_date, a.average_age, a.created_at, b.nick_name, b.profile, b.profile_thumb FROM MBoard AS a '+
  'JOIN users AS b ON(a.writer_id=b.uid) ' + whereSql1 + orderData + offsetSql + ' ORDER BY a.created_at DESC LIMIT 10';

  console.log(sql);
  for(var i=0;i<areaNoArray.lenth;i++){
    console.log(areaNoArray[i]);
  }
  conn.query(sql, areaNoArray, function(err, result, fields){
    if(err){
      console.log(err);
    }else{
      res.json(responseUtil.successTrueWithData(result));
    }
  })
})


module.exports = router;
