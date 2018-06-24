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
 * 회원가입 시 uid, nickName, loginType을 받아와 db에 저장한다.
 */
router.post('/', function(req, res){
  var uid = req.body.uid;
  var nickName = req.body.nickName;
  var loginType = req.body.loginType;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
  var sql = 'INSERT INTO users (uid, login_type, nick_name, created_at) VALUES(?, ?, ?, ?)';

  conn.query(sql, [uid, loginType, nickName, currentTime], function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }else{
      var sql = 'SELECT * FROM users WHERE uid=?';
      conn.query(sql, [uid], function(err, result, fields){
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
    }
  });
})

/*
 * 로그인 시 uid값을 받아와 해당 user data를 내려준다.
 */
router.get('/:uid', function(req, res){
  var uid = req.params.uid;
  console.log(uid);
  var sql = 'SELECT * FROM users WHERE uid=?';

  conn.query(sql, [uid], function(err, result, fields){
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
