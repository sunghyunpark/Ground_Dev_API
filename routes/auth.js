require('date-utils');
require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var responseUtil = require('../util/responseUtil');
var router = express.Router();
var jwt = require('jsonwebtoken');

var mysql = require('mysql');
var conn = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});
conn.connect();

router.post('/', function(req, res){
  var uid = req.body.uid;
  var nickName = req.body.nickName;
  var loginType = req.body.loginType;
  var fcmToken = req.body.fcmToken;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');

  var payload = {
    uid : uid,
    nickName : nickName
  };
  var secretOrPrivateKey = process.env.JWT_SECRET;
  var options = {expiresIn : 60 * 60 * 24};
  jwt.sign(patload, secretOrPrivateKey, options, function(err, token){
    if(err){
      console.log(err);
    }else{
      console.log(token);
    }
  })

})

/*
 * 로그인 시 uid값을 받아와 해당 user data를 내려준다.
 */
router.get('/:uid', function(req, res){
  var uid = req.params.uid;


})

module.exports = router;
