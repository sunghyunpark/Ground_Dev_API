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

router.get('/', function(req, res){
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

module.exports = router;
