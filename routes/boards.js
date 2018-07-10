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
router.post('/', function(req, res){
  var areaNo = req.body.areaNo;
  var uid = req.body.uid;
  var title = req.body.title;
  var contents = req.body.contents;
  var boardType = req.body.boardType;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
  var tableName;
  var updateTableName;

/**
* boardType으로 먼저 매칭, 용병, 모집을 나눈다.
*/
  if(boardType == 'match'){
    if(areaNo < 9){
      //seoul
      tableName = 'MBoard_Seoul';
    }else if(areaNo > 9){
      //gyeong gi
      tableName = 'MBoard_Gyeonggi';
    }else{
      console.log('error');
    }
    updateTableName = 'MBoardUpdate';
  }else if(boardType == 'hire'){
    tableName = 'HBoard';
    updateTableName = 'HBoardUpdate';
  }else if(boardType == 'recruit'){
    tableName = 'RBoard';
    updateTableName = 'RBoardUpdate';
  }

  var sql = 'INSERT INTO '+tableName+' (area_no, writer_id, title, contents, created_at) VALUES(?,?,?,?,?)';
  conn.query(sql, [areaNo, uid, title, contents, currentTime], function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }else{
      var sql = 'UPDATE '+updateTableName+' SET updated_at=? WHERE area_no=?';
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
router.get('/:boardType/:areaNo/:no', function(req, res){
  var no = req.params.no;
  var areaNo = req.params.areaNo;
  var boardType = req.params.boardType;
  var tableName;
  console.log(areaNo);

  /**
  * boardType으로 먼저 매칭, 용병, 모집을 나눈다.
  */
    if(boardType == 'match'){
      if(areaNo < 9){
        //seoul
        tableName = 'MBoard_Seoul';
      }else if(areaNo > 9){
        //gyeong gi
        tableName = 'MBoard_Gyeonggi';
      }else{
        console.log('error');
      }
    }else if(boardType == 'hire'){
      tableName = 'HBoard';
    }else if(boardType == 'recruit'){
      tableName = 'RBoard';
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
* 게시글 내용을 내려준다.
*/
router.get('/:boardType/view/:areaNo/:no', function(req, res){
  var boardType = req.params.boardType;
  var areaNo = req.params.areaNo;
  var no = req.params.no;

  var tableName;
  console.log(areaNo);

  /**
  * boardType으로 먼저 매칭, 용병, 모집을 나눈다.
  */
    if(boardType == 'match'){
      if(areaNo < 9){
        //seoul
        tableName = 'MBoard_Seoul';
      }else if(areaNo > 9){
        //gyeong gi
        tableName = 'MBoard_Gyeonggi';
      }else{
        console.log('error');
      }
    }else if(boardType == 'hire'){
      tableName = 'HBoard';
    }else if(boardType == 'recruit'){
      tableName = 'RBoard';
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
router.post('/view/comment', function(req, res){
  var areaNo = req.body.areaNo;
  var articleNo = req.body.articleNo;
  var writer_id = req.body.writer_id;
  var comment = req.body.comment;
  var boardType = req.body.boardType;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
  var areaName;
  var tableName;
  var updateTableName;

  /**
  * boardType으로 먼저 매칭, 용병, 모집을 나눈다.
  */
    if(boardType == 'match'){
      tableName = 'MComment';
      if(areaNo < 9){
        //seoul
        areaName = 'Seoul';
        updateTableName = 'MBoard_Seoul';
      }else if(areaNo > 9){
        //gyeong gi
        areaName = 'Gyeonggi';
        updateTableName = 'MBoard_Gyeonggi';
      }else{
        console.log('error');
      }
    }else if(boardType == 'hire'){
      areaName = '';
      tableName = 'HComment';
      updateTableName = 'HBoard';
    }else if(boardType == 'recruit'){
      areaName = '';
      tableName = 'RComment';
      updateTableName = 'RBoard';
    }

  var sql = 'INSERT INTO '+tableName+' (article_no, area_name, writer_id, comment, created_at) VALUES(?,?,?,?,?)';

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
router.get('/:boardType/view/:articleNo/:areaNo/commentList/:commentNo', function(req, res){
  var boardType = req.params.boardType;
  var commentNo = req.params.commentNo;
  var articleNo = req.params.articleNo;
  var areaNo = req.params.areaNo;
  var offsetSql;
  var areaName;    // 게시글의 지역 HBoard, RBoard에서는 빈값으로 들어간다.
  var tableName;
  var areaNameSql;

  /**
  * boardType으로 먼저 매칭, 용병, 모집을 나눈다.
  */
    if(boardType == 'match'){
      if(areaNo < 9){
        //seoul
        areaName = 'Seoul';
      }else if(areaNo > 9){
        //gyeong gi
        areaName = 'Gyeonggi';
      }
      tableName = 'MComment';

      if(commentNo == 0){
        offsetSql = '';
      }else{
        offsetSql = 'AND a.created_at < (SELECT created_at FROM '+tableName+' WHERE no=?)';
      }

      var sql = 'SELECT a.no, a.article_no, a.area_name, a.writer_id, a.comment, a.blocked, a.created_at, b.nick_name, b.profile, b.profile_thumb FROM '+tableName+
      ' AS a JOIN users AS b ON(a.writer_id = b.uid) WHERE a.article_no=? AND a.area_name=? '+offsetSql+' ORDER BY a.created_at DESC LIMIT 10';
      conn.query(sql, [articleNo, areaName, commentNo], function(err, result, fields){
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

    }else{
      if(boardType == 'hire'){
        tableName = 'HComment';
      }else if(boardType == 'recruit'){
        tableName = 'RComment';
      }
      if(commentNo == 0){
        offsetSql = '';
      }else{
        offsetSql = 'AND a.created_at < (SELECT created_at FROM '+tableName+' WHERE no=?)';
      }

      var sql = 'SELECT a.no, a.article_no, a.area_name, a.writer_id, a.comment, a.blocked, a.created_at, b.nick_name, b.profile, b.profile_thumb FROM '+tableName+
      ' AS a JOIN users AS b ON(a.writer_id = b.uid) WHERE a.article_no=? '+offsetSql+' ORDER BY a.created_at DESC LIMIT 10';
      conn.query(sql, [articleNo, commentNo], function(err, result, fields){
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

    }
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
