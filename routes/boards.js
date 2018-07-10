require('date-utils');
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
 * Match : areaNo를 받아와 판단하여 서울/경기를 구분한 뒤 해당 테이블로 insert.
 */
router.post('/matching', function(req, res){
  var areaNo = req.body.areaNo;
  var uid = req.body.uid;
  var title = req.body.title;
  var contents = req.body.contents;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
  var tableName;

  if(areaNo < 9){
    //seoul
    tableName = 'MBoard_Seoul';
  }else if(areaNo > 9){
    //gyeong gi
    tableName = 'MBoard_Gyeonggi';
  }else{
    console.log('error');
  }

  var sql = 'INSERT INTO '+tableName+' (area_no, writer_id, title, contents, created_at) VALUES(?,?,?,?,?)';
  conn.query(sql, [areaNo, uid, title, contents, currentTime], function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }else{
      var sql = 'UPDATE MBoardUpdate SET updated_at=? WHERE area_no=?';
      conn.query(sql, [currentTime, areaNo], function(err, result, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }else{
          res.json({
            code : 200,
            message : 'Success'
          });
        }
      })
    }
  })
})

/*
* Hire : 게시판 insert
*/
router.post('/hire', function(req, res){
  var areaNo = req.body.areaNo;
  var uid = req.body.uid;
  var title = req.body.title;
  var contents = req.body.contents;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');

  var sql = 'INSERT INTO HBoard (area_no, writer_id, title, contents, created_at) VALUES(?,?,?,?,?)';
  conn.query(sql, [areaNo, uid, title, contents, currentTime], function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }else{
      var sql = 'UPDATE HBoardUpdate SET updated_at=? WHERE area_no=?';
      conn.query(sql, [currentTime, areaNo], function(err, result, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }else{
          res.json({
            code : 200,
            message : 'Success'
          });
        }
      })
    }
  })
})

/*
* 상세 지역 > 게시판 List를 내려준다.
*/
router.get('/matching/:areaNo/:no', function(req, res){
  var no = req.params.no;
  var areaNo = req.params.areaNo;
  var tableName;
  console.log(areaNo);

  if(areaNo < 9){
    //seoul
    tableName = 'MBoard_Seoul';
  }else if(areaNo > 9){
    //gyeong gi
    tableName = 'MBoard_Gyeonggi';
  }else{
    console.log('error');
  }
  /*
  * SELECT a.no, a.board_type, a.area_no, a.writer_id, a.title, a.contents, a.blocked, a.view_cnt, a.created_at, b.nick_name
  FROM MBoard_Seoul AS a JOIN users AS b ON(a.writer_id = b.uid) WHERE a.area_no = '1' ORDER BY a.created_at DESC;
  */
  //var sql = 'SELECT * FROM '+tableName+' WHERE area_no=?';
  //"AND a.created_at < (SELECT created_at FROM comment WHERE comment_id = '$bottom_comment') ";
  var offsetSql = 'AND a.created_at < (SELECT created_at FROM '+tableName+' WHERE no=?)';
  if(no == 0){
    offsetSql = '';
  }
  var sql = 'SELECT a.no, a.board_type, a.area_no, a.writer_id, a.title, a.contents, a.blocked, a.view_cnt, a.comment_cnt, a.created_at, b.nick_name FROM '+
  tableName+' AS a JOIN users AS b ON(a.writer_id=b.uid) WHERE a.area_no=? '+offsetSql+' ORDER BY a.created_at DESC LIMIT 10';

  conn.query(sql, [areaNo, no], function(err, result, fields){
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
* hire 게시판 리스트
*/
router.get('/hire/:areaNo/:no', function(req, res){
  var no = req.params.no;
  var areaNo = req.params.areaNo;
  var offsetSql = 'AND a.created_at < (SELECT created_at FROM HBoard WHERE no=?)';
  if(no == 0){
    offsetSql = '';
  }
  var sql = 'SELECT a.no, a.board_type, a.area_no, a.writer_id, a.title, a.contents, a.blocked, a.view_cnt, a.comment_cnt, a.created_at, b.nick_name FROM HBoard AS a JOIN users AS b ON(a.writer_id=b.uid) WHERE a.area_no=? '+offsetSql+' ORDER BY a.created_at DESC LIMIT 10';

  conn.query(sql, [areaNo, no], function(err, result, fields){
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
* 게시글 내용을 내려준다.
*/
router.get('/matching/view/:areaNo/:no', function(req, res){
  var areaNo = req.params.areaNo;
  var no = req.params.no;

  var tableName;
  console.log(areaNo);

  if(areaNo < 9){
    //seoul
    tableName = 'MBoard_Seoul';
  }else if(areaNo > 9){
    //gyeong gi
    tableName = 'MBoard_Gyeonggi';
  }else{
    console.log('error');
  }

/*
 * SELECT a.no, a.board_type, a.area_no, a.writer_id, a.title, a.contents, a.blocked, a.view_cnt, a.created_at, b.nick_name FROM
Mboard_Seoul, AS a JOIN users AS b ON(a.writer_id = b.uid) WHERE a.no = '1';
​
UPDATE MBoard_Seoul SET view_cnt = view_cnt + 1 WHERE no=?;​
*/
  var sql = 'UPDATE '+tableName+' SET view_cnt = view_cnt +1 WHERE no=?';
  conn.query(sql, [no], function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }else{
      var sql = 'SELECT a.no, a.board_type, a.area_no, a.writer_id, a.title, a.contents, a.blocked, a.view_cnt, a.created_at, b.nick_name, b.profile, b.profile_thumb FROM '+
      tableName+' AS a JOIN users AS b ON(a.writer_id = b.uid) WHERE a.no=?';
      conn.query(sql, [no], function(err, result, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }else{
          console.log(result[0].created_at);
          res.json({
            code : 200,
            message : 'Success',
            result : result
          });
        }
      })
    }
  })
})

/*
* 게시글 화면에서 코멘트 Insert
*/
router.post('/matching/view/comment', function(req, res){
  var areaNo = req.body.areaNo;
  var articleNo = req.body.articleNo;
  var writer_id = req.body.writer_id;
  var comment = req.body.comment;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
  var areaName;
  var tableName;

  if(areaNo < 9){
    //seoul
    areaName = 'Seoul';
    tableName = 'MBoard_Seoul';
  }else if(areaNo > 9){
    //gyeong gi
    areaName = 'Gyeonggi';
    tableName = 'MBoard_Gyeonggi';
  }else{
    console.log('error');
  }

  var sql = 'INSERT INTO MComment (article_no, area_name, writer_id, comment, created_at) VALUES(?,?,?,?,?)';

  conn.query(sql, [articleNo, areaName, writer_id, comment, currentTime], function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }else{
      var sql = 'UPDATE '+tableName+' SET comment_cnt = comment_cnt +1 WHERE no=?';
      conn.query(sql, [articleNo], function(err, result, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }else{
          res.json({
            code : 200,
            message : 'Success'
          });
        }
      })
    }
  })

})

/*
* 댓글 리스트를 내려준다.
*/
router.get('/matching/view/:articleNo/:areaNo/commentList/:commentNo', function(req, res){
  var commentNo = req.params.commentNo;
  var articleNo = req.params.articleNo;
  var areaNo = req.params.areaNo;
  var offsetSql = 'AND a.created_at < (SELECT created_at FROM MComment WHERE no=?)';
  var areaName;
  if(areaNo < 9){
    //seoul
    areaName = 'Seoul';
  }else if(areaNo > 9){
    //gyeong gi
    areaName = 'Gyeonggi';
  }else{
    console.log('error');
  }
  if(commentNo == 0){
    offsetSql = '';
  }
  var sql = 'SELECT a.no, a.article_no, a.area_name, a.writer_id, a.comment, a.blocked, a.created_at, b.nick_name, b.profile, b.profile_thumb FROM MComment '+
  'AS a JOIN users AS b ON(a.writer_id = b.uid) WHERE a.area_name=? AND a.article_no=? '+offsetSql+' ORDER BY a.created_at DESC LIMIT 10';

  conn.query(sql, [areaName, articleNo, commentNo], function(err, result, fields){
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
* 매칭 지역별 최근 업데이트 정보를 내려준다
*/
router.get('/matching/updated', function(req, res){
  var sql = 'SELECT * FROM MBoardUpdate';

  conn.query(sql, function(err, result, fields){
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

router.get('/matching/recent', function(req, res){
  var sql = 'SELECT * FROM (SELECT * FROM (SELECT * FROM MBoard_Seoul ORDER BY created_at DESC LIMIT 5) AS a '+
  'UNION ALL SELECT * FROM (SELECT * FROM MBoard_Gyeonggi ORDER BY created_at DESC LIMIT 5) AS b) AS c ORDER BY created_at DESC LIMIT 5';

  conn.query(sql, function(err, result, fields){
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

module.exports = router;
