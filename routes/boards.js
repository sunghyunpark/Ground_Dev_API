require('date-utils');
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var router = express.Router();

var mysql = require('mysql');
var db_config = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'qkr103838!@',
  database : 'ground_dev'
});
var conn;

function handleDisconnect() {
  conn = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  conn.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  conn.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

/*
 * areaNo를 받아와 판단하여 서울/경기를 구분한 뒤 해당 테이블로 insert.
 */
router.post('/matching', function(req, res){
  var areaNo = req.body.areaNo;
  var uid = req.body.uid;
  var title = req.body.title;
  var contents = req.body.contents;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
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
  var sql = 'SELECT * FROM '+tableName+' WHERE area_no=?';

  conn.query(sql, [areaNo], function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }else{
      res.json({
        code : 200,
        message : 'Success',
        result : result[0]
      });
    }
  })
})

module.exports = router;
