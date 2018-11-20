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

/*
* 원하는 날짜 알림 리스트를 받아온다.
*/
router.get('/matchDateAlarm/:uid/:boardType', function(req, res){
  var uid = req.params.uid;
  var boardType = req.params.boardType;

  var sql = 'SELECT board_type AS boardType, '+
  'area_no AS areaNo, '+
  'match_date AS matchDate FROM MatchDateAlarm WHERE board_type=? AND uid=?';

  conn.query(sql, [boardType, uid], function(err, result, fields){
    if(err){
      console.log(err);
      res.json(responseUtil.successFalse(500, 'Internal Server Error'));
    }else{
      res.json(responseUtil.successTrueWithData(result));
    }
  })
})

/*
* 원하는 날짜 알림을 match/hire (boardType)을 통해 구분하여 등록한다.
*/
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

/*
* 원하는 날짜 알림을 삭제한다.
*/
router.delete('/matchDateAlarm/:uid/:boardType/:areaNo/:matchDate', function(req, res){
  var uid = req.params.uid;
  var boardType = req.params.boardType;
  var areaNo = req.params.areaNo;
  var matchDate = req.params.matchDate;

  var sql = 'DELETE FROM MatchDateAlarm WHERE uid=? AND board_type=? AND area_no=? AND match_date=?';
  conn.query(sql, [uid, boardType, areaNo, matchDate], function(err, result, fields){
    if(err){
      console.log(err);
      res.json(responseUtil.successFalse(500, 'Internal Server Error'));
    }else{
      res.json(responseUtil.successTrue('Success'));
    }
  })
})

module.exports = router;
