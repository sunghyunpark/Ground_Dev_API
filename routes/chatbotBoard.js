require('date-utils');
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

router.post('/', function(req, res){
  var writerId = req.body.writerId;
  var title = req.body.title;
  var articleUrl = req.body.articleUrl;
  var matchDate = req.body.matchDate;
  var charge = req.body.charge;
  var playRule = req.body.playRule;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');

  var sql = 'INSERT INTO ChatbotBoard (writer_id, title, article_url, match_date, charge, play_rule, created_at) VALUES(?,?,?,?,?,?,?)';

  conn.query(sql, [writerId, title, articleUrl, matchDate, charge, playRule, currentTime], function(err, result, fields){
    if(err){
      console.log(err);
    }else{
      res.json(responseUtil.successTrue('Success'));
    }
  })
})


module.exports = router;
