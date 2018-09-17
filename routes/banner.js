var express = require('express');
var router = express.Router();

/*
* HOME > 상단 슬라이드 배너 정보
*/
router.get('/ad/home/banner', function(req, res){
  res.json({
    code : 200,
    message : 'Success',
    result : [
      {
        imgPath : 'static/banner/banner_test_1.png',
        url : 'www.m.naver.com'
      },
      {
        imgPath : 'static/banner/banner_test_2.png',
        url : 'www.daum.net'
      }
    ]
  });
});
