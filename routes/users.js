require('date-utils');
require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var responseUtil = require('../util/responseUtil');
var router = express.Router();

var mysql = require('mysql');
var conn = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});
conn.connect();

/*
 * 회원가입 시 uid, nickName, loginType을 받아와 db에 저장한다.
 */
router.post('/', function(req, res){
  var uid = req.body.uid;
  var nickName = req.body.nickName;
  var loginType = req.body.loginType;
  var fcmToken = req.body.fcmToken;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
  var sql = 'INSERT INTO users (uid, login_type, nick_name, fcm_token, created_at) VALUES(?, ?, ?, ?, ?)';

  conn.query(sql, [uid, loginType, nickName, fcmToken, currentTime], function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }else{
      
      var sql = 'SELECT uid, '+
      'login_type AS loginType, '+
      'nick_name AS nickName, '+
      'profile, '+
      'profile_thumb AS profileThumb, '+
      'fcm_token AS fcmToken, '+
      'created_at AS createdAt'+
      ' FROM users WHERE uid=?';

      conn.query(sql, [uid], function(err, result, fields){
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
    }
  });
})

/*
 * 로그인 시 uid값을 받아와 해당 user data를 내려준다.
 */
router.get('/:uid', function(req, res){
  var uid = req.params.uid;
  var sql = 'SELECT uid, '+
  'login_type AS loginType, '+
  'nick_name AS nickName, '+
  'profile, '+
  'profile_thumb AS profileThumb, '+
  'fcm_token AS fcmToken, '+
  'created_at AS createdAt'+
  ' FROM users WHERE uid=?';

  conn.query(sql, [uid], function(err, result, fields){
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

/*
* User profile(nickName) 수정
*/
router.put('/profile', function(req, res){
  var uid = req.body.uid;
  var userName = req.body.userName;

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

/*
* User's fcmToken update
*/
router.put('/profile/fcmToken/:uid/:fcmToken', function(req, res){
  var uid = req.params.uid;
  var fcmToken = req.params.fcmToken;

  var sql = 'UPDATE users SET fcm_token=? WHERE uid=?';
  conn.query(sql, [fcmToken, uid], function(err, result, fields){
    if(err){
      console.log(err);
      res.json({
        code : 500,
        message : 'Internal Server Error'
      });
    }else{
      console.log("user's fcm update success");
      res.json({
        code : 200,
        message : 'Success'
      });
    }
  })
})

module.exports = router;
