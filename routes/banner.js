var express = require('express');
var router = express.Router();

/*
* HOME > 상단 슬라이드 배너 정보
* off를 하려면 type에 off를 해주면된다.(RBBanner, TBBanner)
*/
router.get('/ad/home', function(req, res){
  res.json({
    code : 200,
    message : 'Success',
    mainBanner : [
      {
        type : 'web',
        imgPath : 'static/banner/banner_test_1_2018_11_15_2.png',
        url : 'https://m.naver.com'
      },
      {
        type : 'web',
        imgPath : 'static/banner/banner_test_2.png',
        url : 'https://www.daum.net'
      }
    ],
    RBBanner :
      {//app
        type : 'off',
        imgPath : 'static/banner/recent_board_banner_2018_10_01.png',
        bgColor : '#263238',
        url : 'https://play.google.com/store/apps/details?id='
      },
    TBBanner :
      {//web
        type : 'web',
        imgPath : 'static/banner/today_match_board_banner_2018_11_03_2.png',
        bgColor : '#facc2e',
        url : 'http://pf.kakao.com/_xkYIIj'
      }
  });
});

/*
* 지역별 게시판 상단 배너
*/

router.get('/ad/board', function(req, res){
  res.json({
    code : 200,
    message : 'Success',
    mainBanner : [
      {
        type : 'web',
        imgPath : 'static/banner/banner_test_1_2018_11_03_2.png',
        url : 'https://www.daum.net'
      },
      {
        type : 'web',
        imgPath : 'static/banner/banner_test_2.png',
        url : 'https://m.naver.com'
      }
    ]
  })
})

/*
* 지역별 목록 하단 띠배너
*/

router.get('/ad/areaList', function(req, res){
  res.json({
    code : 200,
    message : 'Success',
    result : [
      {
        imgPath : 'static/banner/banner_test_3.png',
        url : 'https://www.daum.net'
      },
      {
        imgPath : 'static/banner/banner_test_3.png',
        url : 'https://www.daum.net'
      },
      {
        imgPath : 'static/banner/banner_test_3.png',
        url : 'https://www.daum.net'
      }
    ]
  })
})

module.exports = router;
