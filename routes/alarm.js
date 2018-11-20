require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var router = express.Router();
var responseUtil = require('../util/responseUtil');
var conn = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});
conn.connect();

router.get('/matchDateAlarm/:uid/:boardType', function(req, res){
  var uid = req.params.uid;
  var boardType = req.params.boardType;

  var sql = 'SELECT board_type AS boardType, '+
  'area_no AS areaNo, '+
  'match_date AS matchDate FROM MatchDateAlarm WHERE board_type=? AND uid=?';

  conn.query(sql, [boardType, uid], function(err, result, fields){
    if(err){
      console.log(err);
    }else{
      res.json(responseUtil.successTrueWithData(result));
    }
  })
})

router.post('/matchDateAlarm', function(req, res){
  var uid = req.body.uid;
  var boardType = req.body.boardType;
  var areaNo = req.body.areaNo;
  var matchDate = req.body.matchDate;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');

  var sql = 'INSERT INTO MatchDateAlarm (uid, board_type, area_no, match_date, created_at) VALUES(?,?,?,?,?)';

  conn.query(sql, [uid, boardType, areaNo, matchDate, currentTime], function(err, result, fields){
    if(err){
      console.log(err);
      res.json(responseUtil.successFalse(500, 'Internal Server Error'));
    }else{
      res.json(responseUtil.successTrue('Success'));
    }
  })
})

module.exports = router;
