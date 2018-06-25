require('date-utils');
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var router = express.Router();

var mysql = require('mysql');
var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'qkr103838!@',
  database : 'ground_dev'
});
conn.connect();

/*
 * areaNo를 받아와 판단하여 서울/경기를 구분한 뒤 해당 테이블로 insert.
 */
router.post('/matching', function(req, res){
  var areaNo = req.body.areaNo;
  var uid = req.body.uid;
  var title = req.body.title;
  var contents = req.body.contents;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS').toISOString().replace(/T/, ' ').replace(/\..+/,'');
  var tableName;

  if(areaNo < 9){
    //seoul
    tableName = 'MBoard_Seoul';
  }else if(areaNo > 9){
    //gyeong gi
    tableName = 'MBoard_Gyeonggi';
  }else{
    console.log('error');
  }

  var sql = 'INSERT INTO '+tableName+' (area_no, writer_id, title, contents, created_at) VALUES(?,?,?,?,?)';
  conn.query(sql, [areaNo, uid, title, contents, currentTime], function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }else{
      res.json({
        code : 200,
        message : 'Success'
      });
    }
  })
})

router.get('/matching/:areaNo', function(req, res){
  var areaNo = req.params.areaNo;
  var tableName;
  console.log(areaNo);

  if(areaNo < 9){
    //seoul
    tableName = 'MBoard_Seoul';
  }else if(areaNo > 9){
    //gyeong gi
    tableName = 'MBoard_Gyeonggi';
  }else{
    console.log('error');
  }
  /*
  * SELECT a.no, a.board_type, a.area_no, a.writer_id, a.title, a.contents, a.blocked, a.view_cnt, a.created_at, b.nick_name
  FROM MBoard_Seoul AS a JOIN users AS b ON(a.writer_id = b.uid) WHERE a.area_no = '1' ORDER BY a.created_at DESC;
  */
  //var sql = 'SELECT * FROM '+tableName+' WHERE area_no=?';
  var sql = 'SELECT a.no, a.board_type, a.area_no, a.writer_id, a.title, a.contents, a.blocked, a.view_cnt, a.created_at, b.nick_name FROM '+
  tableName+' AS a JOIN users AS b ON(a.writer_id=b.uid) WHERE a.area_no=? ORDER BY a.created_at DESC';

  conn.query(sql, [areaNo], function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
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
