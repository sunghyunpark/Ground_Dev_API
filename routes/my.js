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
* 내가 쓴 글 match / hire / recruit
*/
router.get('/article/:boardType/:uid', function(req, res){
  
})

/*
* 내가 쓴 댓글 match / hire / recruit
*/
router.get('/comment/:boardType/:uid', function(req, res){

})

/*
* 관심있는 글 리스트 match / hire / recruit
*/
router.get('/favorite/:boardType/:uid', function(req, res){

})


module.exports = router;
