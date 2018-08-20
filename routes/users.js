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

/*
* User profile(nickName) 수정 
*/
router.put('/profile/:uid/:userName', function(req, res){
  var uid = req.params.uid;
  var userName = req.params.userName;

  var sql = 'UPDATE users SET nick_name=? WHERE uid=?';

  conn.query(sql, [userName, uid], function(err, result, fields){
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
