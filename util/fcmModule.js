var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

var FCM = require('fcm-node');
var serverKey = 'AAAAYpyLRuA:APA91bHTx-Hr4U5_BOwXzZerbNmqHpE3qFi524p1DAQzug_GyU_-NrrWEM_esngFImr2S4WKYnBGhQZ1HV0_qHWFqVHj45mqvCgY_y6xX-3yDhRboWJPNBaR5OcvCYzqifEB62aglxTrXpc2xsGTKZ6myaSSX1T_ZQ'; //put your server key here
var fcm = new FCM(serverKey);

/*
* Match 게시글(match/hire/recruit)에 댓글이 달렸을 시 푸시
*/
module.exports.sendPushMyArticleByComment = function(toToken, noOfArticle, areaNum, typeOfBoard){
  var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: toToken,
      //collapse_key: 'your_collapse_key',

      notification: {
          title: 'Title of your push notification',
          body: 'Body of your push notification'
      },

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

      notification: {
          title: 'Title of your push notification',
          body: 'Body of your push notification'
      },

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

        notification: {
            title: 'Title of your push notification',
            body: 'Body of your push notification'
        },

        data: {  //you can send only notification or only data(or include both)
            type : 'match',
            title: 'GROUND-그라운드',
            articleNo: noOfArticle,
            areaNo: areaNum,
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
