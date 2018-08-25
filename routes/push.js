var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

var FCM = require('fcm-node');
var serverKey = 'AAAAYpyLRuA:APA91bHTx-Hr4U5_BOwXzZerbNmqHpE3qFi524p1DAQzug_GyU_-NrrWEM_esngFImr2S4WKYnBGhQZ1HV0_qHWFqVHj45mqvCgY_y6xX-3yDhRboWJPNBaR5OcvCYzqifEB62aglxTrXpc2xsGTKZ6myaSSX1T_ZQ'; //put your server key here
var fcm = new FCM(serverKey);

module.exports.sendPushMyArticleByComment = function(toToken){
  var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: toToken,
      //collapse_key: 'your_collapse_key',

      notification: {
          title: 'Title of your push notification',
          body: 'Body of your push notification'
      },

      data: {  //you can send only notification or only data(or include both)
          title: 'push title',
          my_another_key: 'my another value'
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

//module.exports = router;
