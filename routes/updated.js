require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var router = express.Router();
var sortModule = require('../util/sortModule');
var responseUtil = require('../util/responseUtil');

var conn = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});
conn.connect();

/*
* match / hire / recruit / free의 게시글의 최근 업데이트 시간 리스트를 내려준다.
*
*/
router.get('/:boardType', function(req, res){
  var boardType = req.params.boardType;
  var updateTableName = sortModule.sortUpdateTableName(boardType);
  var sql = '';
  if(boardType == 'free'){
    // 자유게시판인 경우
    sql = 'SELECT created_at FROM FBoard ORDER BY created_at DESC limit 1';
  }else{
    // 매칭 / 용병 / 모집 게시판의 경우
    sql = 'SELECT * FROM '+updateTableName;
  }

  conn.query(sql, function(err, result, fields){
    res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrueWithData(result));
  })
})


module.exports = router;
