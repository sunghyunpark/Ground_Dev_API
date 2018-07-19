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

/**
* [게시판 글쓰기]
* MBoard Table에 먼저 insert를 한다.
* area_no을 통해 서울, 경기를 나눈뒤에 그에 맞는 SubTable(MBoard_Seoul, MBoard_Gyeonggi)에 insert한다.
* MBoard에 insert를 한 뒤 insertId(no)를 받아와 SubTable에 똑같이 insert를 해준다.
* Hire, Recruit의 경우는 SubTable이 없으므로 바로 insert를 해준다.
* boardType으로 먼저 매칭, 용병, 모집을 나눈다.
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

  if(boardType == 'match'){
    //Mboard에 insert를 한다.
    var sql = 'INSERT INTO MBoard (area_no, writer_id, title, contents, created_at) VALUES(?,?,?,?,?)';
    conn.query(sql, [areaNo, uid, title, contents, currentTime], function(err, result, fields){
      if(err){
        //MBoard insert 실패
        console.log(err);
        res.json({
          code : 500,
          message : 'Internal Server Error'
        });
      }else{
        //Mboard insert 성공 후 area_no를 통해 SubTable을 분기처리.
        if(areaNo < 9){
          //seoul
          tableName = 'MBoard_Seoul';
        }else if(areaNo > 9){
          //gyeong gi
          tableName = 'MBoard_Gyeonggi';
        }else{
          console.log('error');
        }
        //SubTable에 MBoard에 insert 한 내용을 그대로 넣어준다. 이때, SubTable의 no은 auto_increment가 아니므로 MBoard의 no(auto_increment)을 넣어준다.
        var sql = 'INSERT INTO '+tableName+' (no, area_no, writer_id, title, contents, created_at) VALUES(?,?,?,?,?,?)';
        conn.query(sql, [result.insertId, areaNo, uid, title, contents, currentTime], function(err, result, fields){
          if(err){
            //SubTable insert 실패
            console.log(err);
            res.json({
              code : 500,
              message : 'Internal Server Error'
            });
          }else{
            //SubTable insert 성공 후 MBoardUpdate에 최근 시간을 업데이트해준다.
            var sql = 'UPDATE MBoardUpdate SET updated_at=? WHERE area_no=?';
            conn.query(sql, [currentTime, areaNo], function(err, result, fields){
              if(err){
                console.log(err);
                res.json({
                  code : 500,
                  message : 'Internal Server Error'
                });
              }else{
                res.json({
                  code : 200,
                  message : 'Success'
                });
              }
            })
          }
        })
      }
    })
    return;
  }else if(boardType == 'hire'){
    tableName = 'HBoard';
    updateTableName = 'HBoardUpdate';
  }else if(boardType == 'recruit'){
    tableName = 'RBoard';
    updateTableName = 'RBoardUpdate';
  }

  //hire / recruit를 통해 분기처리된 HBoard or RBoard에 insert 한다.
  var sql = 'INSERT INTO '+tableName+' (area_no, writer_id, title, contents, created_at) VALUES(?,?,?,?,?)';
  conn.query(sql, [areaNo, uid, title, contents, currentTime], function(err, result, fields){
    if(err){
      // insert 실패
      console.log(err);
      res.json({
        code : 500,
        message : 'Internal Server Error'
      });
    }else{
      // insert 성공 후 해당 테이블의 UpdateTable에 최근 시간 업데이트
      var sql = 'UPDATE '+updateTableName+' SET updated_at=? WHERE area_no=?';
      conn.query(sql, [currentTime, areaNo], function(err, result, fields){
        if(err){
          console.log(err);
          res.json({
            code : 500,
            message : 'Internal Server Error'
          });
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
* [게시판 목록]
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
      res.json({
        code : 500,
        message : 'Internal Server Error'
      });
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
* [게시글 상세화면의 데이터]
* boardType을 통해 match/hire/recruit를 받아온다.
* match의 경우 area_no를 통해 서울, 경기를 분기처리한다.
* 게시글의 데이터를 조회하기전에 해당 게시글의 조회수를 +1하도록 update 쿼리를 수행한다.
* 조회수 update 쿼리가 성공하게되면 해당 게시글의 데이터를 조회한다.
* FavoriteState > 0: not like, 1: like
*/
router.get('/:boardType/view/:areaNo/:no', function(req, res){
  var boardType = req.params.boardType;
  var areaNo = req.params.areaNo;
  var no = req.params.no;

  var tableName;
  var tableNameOfFavorite;
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
      //MBoard에 view_cnt를 증가시킨다.
      var sql = 'UPDATE MBoard SET view_cnt = view_cnt +1 WHERE no=?';
      conn.query(sql, [no], function(err, result, fields){
        if(err){
          console.log(err);
          res.json({
            code : 500,
            message : 'Internal Server Error'
          });
        }else{
          // MBoard에 해당 게시글의 조회수 업데이트 후 분기처리된 Table의 게시판 조회수를 +1하도록 update 쿼리를 수행한다.
          var sql = 'UPDATE '+tableName+' SET view_cnt = view_cnt +1 WHERE no=?';
          conn.query(sql, [no], function(err, result, fields){
            if(err){
              //조회수 쿼리 실패
              console.log(err);
              res.json({
                code : 500,
                message : 'Internal Server Error'
              });
            }else{
              // 조회수 쿼리 성공 시 해당 게시글의 데이터를 받아온다.
              var sql = 'SELECT a.no, a.board_type, a.area_no, a.writer_id, a.title, a.contents, a.blocked, a.view_cnt, '+
              'a.created_at, b.nick_name, b.profile, b.profile_thumb, (SELECT EXISTS (SELECT * FROM MBFavorite where article_no=?)) AS favoriteState FROM '+
              tableName+' AS a JOIN users AS b ON(a.writer_id = b.uid) WHERE a.no=?';
              conn.query(sql, [no, no], function(err, result, fields){
                if(err){
                  console.log(err);
                  res.json({
                    code : 500,
                    message : 'Internal Server Error'
                  });
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
        }
      })
      return;
    }else if(boardType == 'hire'){
      tableName = 'HBoard';
      tableNameOfFavorite = 'HBFavorite';
    }else if(boardType == 'recruit'){
      tableName = 'RBoard';
      tableNameOfFavorite = 'RBFavorite';
    }
    //hire / recruit인 경우
    var sql = 'UPDATE '+tableName+' SET view_cnt = view_cnt +1 WHERE no=?';
    conn.query(sql, [no], function(err, result, fields){
      if(err){
        //조회수 쿼리 실패
        console.log(err);
        res.json({
          code : 500,
          message : 'Internal Server Error'
        });
      }else{
        // 조회수 쿼리 성공 시 해당 게시글의 데이터를 받아온다.
        var sql = 'SELECT a.no, a.board_type, a.area_no, a.writer_id, a.title, a.contents, a.blocked, a.view_cnt, '+
        'a.created_at, b.nick_name, b.profile, b.profile_thumb, (SELECT EXISTS (SELECT * FROM '+tableNameOfFavorite+' where article_no=?)) AS favoriteState FROM '+
        tableName+' AS a JOIN users AS b ON(a.writer_id = b.uid) WHERE a.no=?';
        conn.query(sql, [no, no], function(err, result, fields){
          if(err){
            console.log(err);
            res.json({
              code : 500,
              message : 'Internal Server Error'
            });
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
* [게시글 상세 화면에서 댓글 입력]
* 게시글 화면에서 코멘트 Insert
* 댓글 insert 후 해당 게시글의 comment_cnt를 +1 해주며 업데이트한다.
* boardType이 match인 경우에는 최종적으로 MBoard에서도 comment_cnt를 업데이트해준다.
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

  // 분기처리된 Table에 댓글을 insert 한다.
  var sql = 'INSERT INTO '+tableName+' (article_no, area_name, writer_id, comment, created_at) VALUES(?,?,?,?,?)';
  conn.query(sql, [articleNo, areaName, writer_id, comment, currentTime], function(err, result, fields){
    if(err){
      console.log(err);
      res.json({
        code : 500,
        message : 'Internal Server Error'
      });
    }else{
      //댓글 insert 성공 후 해당 게시글 Table에서 comment_Cnt를 +1 업데이트해준다.
      var sql = 'UPDATE '+updateTableName+' SET comment_cnt = comment_cnt +1 WHERE no=?';
      conn.query(sql, [articleNo], function(err, result, fields){
        if(err){
          console.log(err);
          res.json({
            code : 500,
            message : 'Internal Server Error'
          });
        }else{
          //boardType이 match인 경우 MBoard내에서도 comnment_cnt를 업데이트해준다.
          if(boardType == 'match'){
          var sql = 'UPDATE MBoard SET comment_cnt = comment_cnt +1 WHERE no=?';
          conn.query(sql, [articleNo], function(err, result, fields){
            if(err){
              res.json({
                code : 500,
                message : 'Internal Server Error'
              });
            }else{
              res.json({
                code : 200,
                message : 'Success'
              });
            }
          })
        }else{
          //boardType이 match가 아닌 경우
          res.json({
            code : 200,
            message : 'Success'
          });
        }
        }
      })
    }
  })

})

/*
* [댓글 리스트]
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
          res.json({
            code : 500,
            message : 'Internal Server Error'
          });
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
          res.json({
            code : 500,
            message : 'Internal Server Error'
          });
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
* match / hire / recruit의 게시글의 최근 업데이트 시간 리스트를 내려준다.
*/
router.get('/:boardType/updated', function(req, res){
  var boardType = req.params.boardType;
  var tableName;

  if(boardType == 'match'){
    tableName = 'MBoardUpdate';
  }else if(boardType == 'hire'){
    tableName = 'HBoardUpdate';
  }else if(boardType == 'recruit'){
    tableName = 'RBoardUpdate';
  }
  var sql = 'SELECT * FROM '+tableName;

  conn.query(sql, function(err, result, fields){
    if(err){
      console.log(err);
      res.json({
        code : 500,
        message : 'Internal Server Error'
      });
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
* 최신글 리스트를 5개씩 내려준다.(match / hire / recruit)
*/
router.get('/:boardType/recent', function(req, res){
  var boardType = req.params.boardType;
  var tableName;

  if(boardType == 'match'){
    tableName = 'MBoard';
  }else if(boardType == 'hire'){
    tableName = 'HBoard';
  }else if(boardType == 'recruit'){
    tableName = 'RBoard';
  }

  var sql = 'SELECT * FROM '+tableName+' ORDER BY created_at DESC LIMIT 5';
  conn.query(sql, function(err, result, fields){
    if(err){
      console.log(err);
      res.json({
        code : 500,
        message : 'Internal Server Error'
      });
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
* 임의의 아티클을 좋아요 눌렀을 때 favoriteState(boolean)을 통해 좋아요인지 취소인지 판별한다.
*/
router.post('/favorite', function(req, res){
  var favoriteState = req.body.favoriteState;
  var articleNo = req.body.articleNo;
  var uid = req.body.uid;
  var boardType = req.body.boardType;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
  var tableName;

  /*
  * boardType으로 MBFavorite / HBFavorite / RBFavorite 분기처리
  */
  if(boardType == 'match'){
    tableName = 'MBFavorite';
  }else if(boardType == 'hire'){
    tableName = 'HBFavorite';
  }else if(boardType == 'recruit'){
    tableName = 'RBFavorite';
  }

  if(favoriteState){
    //like
    var sql = 'INSERT INTO '+tableName+' (article_no, uid, created_at) VALUES(?,?,?)';
    conn.query(sql, [articleNo, uid, currentTime], function(err, result, fields){
      if(err){
        console.log(err);
        res.json({
          code : 500,
          message : 'Internal Server Error'
        });
      }else{
        res.json({
          code : 200,
          message : 'Success'
        });
      }
    })
  }else{
    //not like
    var sql = 'DELETE FROM '+tableName+' WHERE uid =? AND article_no =?';
    conn.query(sql, [uid, articleNo], function(err, result, fields){
      if(err){
        console.log(err);
        res.json({
          code : 500,
          message : 'Internal Server Error'
        });
      }else{
        res.json({
          code : 200,
          message : 'Success'
        });
      }
    })
  }
})

module.exports = router;
