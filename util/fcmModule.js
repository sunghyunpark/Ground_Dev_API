require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var router = express.Router();
var responseUtil = require('../util/responseUtil');
var FCM = require('fcm-node');
var serverKey = 'AAAAYpyLRuA:APA91bHTx-Hr4U5_BOwXzZerbNmqHpE3qFi524p1DAQzug_GyU_-NrrWEM_esngFImr2S4WKYnBGhQZ1HV0_qHWFqVHj45mqvCgY_y6xX-3yDhRboWJPNBaR5OcvCYzqifEB62aglxTrXpc2xsGTKZ6myaSSX1T_ZQ'; //put your server key here
var fcm = new FCM(serverKey);

var conn = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});
conn.connect();


/*
* Match 게시글(match/hire/recruit)에 댓글이 달렸을 시 푸시
*/
module.exports.sendPushMyArticleByComment = function(toToken, noOfArticle, areaNum, typeOfBoard){
  var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: toToken,
      //collapse_key: 'your_collapse_key',

      data: {  //you can send only notification or only data(or include both)
          type : 'commentOfMatch',
          title: 'GROUND-그라운드',
          articleNo: noOfArticle,
          areaNo: areaNum,
          boardType: typeOfBoard,
          message: '작성한 게시글에 댓글이 달렸습니다.'
      }
  };

  fcm.send(message, function(err, response){
      if (err) {
          console.log("Something has gone wrong!");
      } else {
          console.log("Successfully sent with response: ", response);
      }
  });
}

/*
* 자유게시판 게시글에 댓글이 달렸을 시 푸시
*/
module.exports.sendPushMyCommunityArticleByComment = function(toToken, noOfArticle, typeOfBoard){
  var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: toToken,
      //collapse_key: 'your_collapse_key',

      data: {  //you can send only notification or only data(or include both)
          type : 'commentOfFree',
          title: 'GROUND-그라운드',
          articleNo: noOfArticle,
          boardType: typeOfBoard,
          message: '작성한 자유게시글에 댓글이 달렸습니다.'
      }
  };

  fcm.send(message, function(err, response){
      if (err) {
          console.log("Something has gone wrong!");
      } else {
          console.log("Successfully sent with response: ", response);
      }
  });
}

/*
* 사용자가 관심을 누른 임의의 게시글의 매칭 상태가 '완료' 로 바뀐 경우
*/
  module.exports.sendPushMatchArticleOfFavorite = function(toToken, noOfArticle, areaNo, typeOfBoard){
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: toToken,
        //collapse_key: 'your_collapse_key',

        data: {  //you can send only notification or only data(or include both)
            type : 'match',
            title: 'GROUND-그라운드',
            articleNo: noOfArticle,
            areaNo: areaNo,
            boardType: typeOfBoard,
            message: '관심을 누른 게시글의 매칭 상태가 완료로 변경되었습니다.'
        }
    };

    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
  }

  /*
  * 원하는 날짜 및 지역 게시글 등록 시 푸시 알림
  */
  module.exports.sendPushMatchDateAlarm = function(toToken, onOfArticle, areaNo, typeOfBoard){
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: toToken,
        //collapse_key: 'your_collapse_key',

        data: {  //you can send only notification or only data(or include both)
            type : 'matchDateAlarm',
            title: 'GROUND-그라운드',
            articleNo: noOfArticle,
            areaNo: areaNo,
            boardType: typeOfBoard,
            message: '알림을 설정하신 날짜 및 지역에 게시글이 등록되었습니다.'
        }
    };

    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
  }

  module.exports.getMatchDateAlarmFcmToken = function(noOfArticle, areaNo, typeOfBoard, matchDate){
    var sql = 'SELECT b.fcm_token FROM MatchDateAlarm AS a JOIN users AS b ON(a.uid=b.uid) WHERE a.board_type=? AND a.area_no=? AND a.match_date=?';
    conn.query(sql, [typeOfBoard, areaNo, matchDate], function(err, result, fields){
      if(err){
        console.log(err);
        console.log('push error matchDateAlarm fcm!');
        res.json(responseUtil.successFalse(500, 'Internal Server Error'));
      }else{
          Object.keys(result).forEach(function(key){
          var row = result[key];
          console.log(row.fcm_token);
          //sendPushMatchDateAlarm(row.fcm_token, noOfArticle, areaNo, boardType);

          var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
              to: row.fcm_token,
              //collapse_key: 'your_collapse_key',

              data: {  //you can send only notification or only data(or include both)
                  type : 'matchDateAlarm',
                  title: 'GROUND-그라운드',
                  articleNo: noOfArticle,
                  areaNo: areaNo,
                  boardType: typeOfBoard,
                  message: '알림을 설정하신 날짜 및 지역에 게시글이 등록되었습니다.'
              }
          };

          fcm.send(message, function(err, response){
              if (err) {
                  console.log("Something has gone wrong!");
              } else {
                  console.log("Successfully sent with response: ", response);
              }
          });

        })
        //console.log(result[1].fcm_token);
        console.log('success to matchDateAlarm');
      }
    })
  }
