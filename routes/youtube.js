var express = require('express');
var router = express.Router();

router.get('/recommend', function(req, res){
  res.json({
    code : 200,
    message : 'Success',
    state : 'on',
    youtubeList : [
      {
        type : 'app',
        imgPath : 'https://img.youtube.com/vi/QPd2phfNlZw/mqdefault.jpg',
        videoId : 'QPd2phfNlZw',
        title : '호날두 감아차기 꿀팁[비밀공개ㅋ]'
      },
      {
        type : 'app',
        imgPath : 'https://img.youtube.com/vi/ZuIXlr3QOiA/mqdefault.jpg',
        videoId : 'ZuIXlr3QOiA',
        title : '발렌시아 이강인 손흥민 넘고 축구 새 역사 쓴이유!'
      },
      {
        type : 'app',
        imgPath : 'https://img.youtube.com/vi/0ZCfceDeq4g/mqdefault.jpg',
        videoId : '0ZCfceDeq4g',
        title : '[알쓸축잡] 풋살 국대가 알려주는 동네 풋살 씹어먹는 기본기 3종 세트 풋살 스킬 강좌'
      },
      {
        type : 'app',
        imgPath : 'https://img.youtube.com/vi/DS9164x7k9s/mqdefault.jpg',
        videoId : 'DS9164x7k9s',
        title : '풋살 골 많이 넣기 위한 방법 ㄷㄷ...'
      },
      {
        type : 'app',
        imgPath : 'https://img.youtube.com/vi/4WGnpN12I0U/mqdefault.jpg',
        videoId : '4WGnpN12I0U',
        title : '누구나 할 수 있는 화려하면서 유용한 기술'
      }
    ]
  });
})

module.exports = router;
