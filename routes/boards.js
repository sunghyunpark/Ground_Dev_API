require('date-utils');
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var router = express.Router();
var sortModule = require('./module.js');
var fcmModule = require('./push.js');

var mysql = require('mysql');
var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'qkr103838!@',
  database : 'ground_dev'
});
conn.connect();

/*
* post > '/' -> 글 쓰기
* put > '/edit/:boardType/:areaNo/:no/:title/:contents' -> 글 수정
* delete > '/delete/:boardType/:no/:uid' -> 글 삭제
* get > '/:boardType/:areaNo/:no' -> 글 목록 내려줌.
* get > '/:boardType/view/:areaNo/:no/:uid' -> 글 상세화면
* post > '/view/comment' -> 댓글 입력
* get > '/:boardType/view/:articleNo/:areaNo/commentList/:commentNo' -> 댓글 목록 내려줌.
* get > '/:boardType/updated' -> 게시글 업데이트 시간
* get > '/recent/:boardType/:no/:limit' -> 최신글 내려줌.
* post > '/favorite' -> 좋아요 및 취소
* put > 'view/matchState/:areaNo/:no/:state' -> 매칭 상태
*
*/

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
  var matchDate = req.body.matchDate;
  var averageAge = req.body.averageAge;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
  var tableName = sortModule.sortTableNameOfArticle(boardType, areaNo);
  var updateTableName = sortModule.sortUpdateTableName(boardType);

  if(boardType == 'match'){
    //Mboard에 insert를 한다.
    var sql = 'INSERT INTO MBoard (area_no, writer_id, title, contents, match_date, average_age, created_at) VALUES(?,?,?,?,?,?,?)';
    conn.query(sql, [areaNo, uid, title, contents, matchDate, averageAge, currentTime], function(err, result, fields){
      if(err){
        //MBoard insert 실패
        console.log(err);
        res.json({
          code : 500,
          message : 'Internal Server Error'
        });
      }else{
        //SubTable에 MBoard에 insert 한 내용을 그대로 넣어준다. 이때, SubTable의 no은 auto_increment가 아니므로 MBoard의 no(auto_increment)을 넣어준다.
        var sql = 'INSERT INTO '+tableName+' (no, area_no, writer_id, title, contents, match_date, average_age, created_at) VALUES(?,?,?,?,?,?,?,?)';
        conn.query(sql, [result.insertId, areaNo, uid, title, contents, matchDate, averageAge, currentTime], function(err, result, fields){
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
  }

  //hire / recruit를 통해 분기처리된 HBoard or RBoard에 insert 한다.
  var sql = 'INSERT INTO '+tableName+' (area_no, writer_id, title, contents, created_at) VALUES(?,?,?,?,?,?,?)';
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

/**
* [게시판 글 수정]
* boardType을 가지고 분기처리 후 그에 맞게 Update문을 실행한다.
*/
router.put('/edit/:boardType/:areaNo/:no/:title/:contents/:matchDate/:averageAge', function(req, res){
  var boardType = req.params.boardType;
  var areaNo = req.params.areaNo;
  var no = req.params.no;
  var title = req.params.title;
  var contents = req.params.contents;
  var matchDate = req.params.matchDate;
  var averageAge = req.params.averageAge;
  var tableName = sortModule.sortTableNameOfArticle(boardType, areaNo);

  if(boardType == 'match'){
    var sql = 'UPDATE MBoard SET title=?, contents=?, match_date=?, average_age=? WHERE no=?';
    conn.query(sql, [title, contents, matchDate, averageAge, no], function(err, result, fields){
      if(err){
        console.log(err);
        res.json({
          code : 500,
          message : 'Internal Server Error'
        });
      }
    })
  }

  var sql = 'UPDATE '+tableName+' SET title=?, contents=? WHERE no=?';
  conn.query(sql, [title, contents, no], function(err, result, fields){
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
})

/*
* 게시글 삭제
* MBoard의 경우 MBoard에서 삭제하면 서브 테이블인 MBoard_Seoul, MBoard_Gyeonggi에서도 자동으로 삭제된다.
*/
router.delete('/delete/:boardType/:no/:uid', function(req, res){
  var boardType = req.params.boardType;
  var no = req.params.no;
  var uid = req.params.uid;
  var tableName;

  if(boardType == 'match'){
    tableName = 'MBoard';
  }else{
    tableName = sortModule.sortTableNameOfArticle(boardType, 0);    // hire, recruit 의 경우엔 areaNo가 필요없어서 0값으로 넣어준다.
  }

  var sql = 'DELETE FROM '+tableName+' WHERE no=? AND writer_id=?';
  conn.query(sql, [no, uid], function(err, result, fields){
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
})

/*
* [게시판 목록]
* 상세 지역 > 게시판 List를 내려준다.
*/
router.get('/:boardType/:areaNo/:no', function(req, res){
  var no = req.params.no;
  var areaNo = req.params.areaNo;
  var boardType = req.params.boardType;
  var tableName = sortModule.sortTableNameOfArticle(boardType, areaNo);

  var offsetSql = 'AND a.created_at < (SELECT created_at FROM '+tableName+' WHERE no=?)';
  var matchData = '';
  if(no == 0){
    offsetSql = '';
  }
  if(boardType == 'match'){
    matchData = ' a.match_date, a.average_age,';
  }
  var sql = 'SELECT a.no, a.board_type, a.area_no, a.writer_id, a.title, a.contents, a.match_state, a.blocked, a.view_cnt, '+
  'a.comment_cnt,'+matchData+' a.created_at, b.nick_name, b.profile, b.profile_thumb FROM '+
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
router.get('/:boardType/view/:areaNo/:no/:uid', function(req, res){
  var boardType = req.params.boardType;
  var areaNo = req.params.areaNo;
  var no = req.params.no;
  var uid = req.params.uid;
  var tableName = sortModule.sortTableNameOfArticle(boardType, areaNo);
  var tableNameOfFavorite = sortModule.sortTableNameOfFavorite(boardType);

  /**
  * boardType으로 먼저 매칭, 용병, 모집을 나눈다.
  */
    if(boardType == 'match'){
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
              // 조회수 쿼리 성공 시 해당 게시글의 etc data를 내려준다.
              var sql = 'SELECT EXISTS (SELECT * FROM MBFavorite where article_no=? AND uid=?) AS favoriteState';
              conn.query(sql, [no, uid], function(err, result, fields){
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
                    favoriteState : result[0].favoriteState
                  });
                }
              })
            }
          })
        }
      })
      return;
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
        var sql = 'SELECT EXISTS (SELECT * FROM '+tableNameOfFavorite+' where article_no=? AND uid=?) AS favoriteState';
        conn.query(sql, [no, uid], function(err, result, fields){
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
              favoriteState : result[0].favoriteState
            });
          }
        })
      }
    })
})

/*
* 위의 api와는 다른게 사용해야함
* 본 api는 boardType, areaNo, articleNo, uid만 있으면 해당 게시글의 데이터를 가져올 수 있다.
* 스키마, 푸시, 댓글 탭하여 상세 게시글 이동에 사용된다.
*/
router.get('/:boardType/detailView/:areaNo/:no/:uid', function(req, res){
  var boardType = req.params.boardType;
  var areaNo = req.params.areaNo;
  var no = req.params.no;
  var uid = req.params.uid;

  var tableNameOfArticle = sortModule.sortTableNameOfArticle(boardType, areaNo);
  var tableNameOfFavorite = sortModule.sortTableNameOfFavorite(boardType);
  console.log(areaNo);

  /**
  * boardType으로 먼저 매칭, 용병, 모집을 나눈다.
  */
    if(boardType == 'match'){
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
          var sql = 'UPDATE '+tableNameOfArticle+' SET view_cnt = view_cnt +1 WHERE no=?';
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
              var sql = 'SELECT a.no, a.board_type, a.area_no, a.writer_id, a.title, a.contents, a.match_state, a.blocked, a.view_cnt, a.match_date, a.average_age, '+
              'a.created_at, b.nick_name, b.profile, b.profile_thumb, (SELECT EXISTS (SELECT * FROM MBFavorite where article_no=? AND uid=?)) AS favoriteState FROM '+
              tableNameOfArticle+' AS a JOIN users AS b ON(a.writer_id = b.uid) WHERE a.no=?';
              conn.query(sql, [no, uid, no], function(err, result, fields){
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
    }
    //hire / recruit인 경우
    var sql = 'UPDATE '+tableNameOfArticle+' SET view_cnt = view_cnt +1 WHERE no=?';
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
        var sql = 'SELECT a.no, a.board_type, a.area_no, a.writer_id, a.title, a.contents, a.match_state, a.blocked, a.view_cnt, '+
        'a.created_at, b.nick_name, b.profile, b.profile_thumb, (SELECT EXISTS (SELECT * FROM '+tableNameOfFavorite+' where article_no=? AND uid=?)) AS favoriteState FROM '+
        tableNameOfArticle+' AS a JOIN users AS b ON(a.writer_id = b.uid) WHERE a.no=?';
        conn.query(sql, [no, uid, no], function(err, result, fields){
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
  var areaName = sortModule.sortAreaName(boardType, areaNo);
  var tableNameOfComment = sortModule.sortTableNameOfComment(boardType);
  var tableNameOfArticle = sortModule.sortTableNameOfArticle(boardType, areaNo);

  // 분기처리된 Table에 댓글을 insert 한다.
  var sql = 'INSERT INTO '+tableNameOfComment+' (article_no, area_name, writer_id, comment, created_at) VALUES(?,?,?,?,?)';
  conn.query(sql, [articleNo, areaName, writer_id, comment, currentTime], function(err, result, fields){
    if(err){
      console.log(err);
      res.json({
        code : 500,
        message : 'Internal Server Error'
      });
    }else{
      //댓글 insert 성공 후 해당 게시글 Table에서 comment_Cnt를 +1 업데이트해준다.
      var sql = 'UPDATE '+tableNameOfArticle+' SET comment_cnt = comment_cnt +1 WHERE no=?';
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

  var tableNameOfCommnetArticle;
  if(boardType == 'match'){
    tableNameOfCommnetArticle = 'MBoard';
  }else if(boardType == 'hire'){
    tableNameOfCommnetArticle = 'HBoard';
  }else{
    tableNameOfCommnetArticle = 'RBoard';
  }
  var sql = 'SELECT a.fcm_token, b.area_no FROM users AS a JOIN '+tableNameOfCommnetArticle+' AS b ON(a.uid = b.writer_id) WHERE b.no=?';
  conn.query(sql, [articleNo], function(err, result, fields){
    if(err){
      console.log(err);
    }else{
      fcmModule.sendPushMyArticleByComment(result[0].fcm_token, result[0].area_no);
      console.log('push ok');
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
  var areaName = sortModule.sortAreaName(boardType, areaNo);    // 게시글의 지역 HBoard, RBoard에서는 빈값으로 들어간다.
  var tableNameOfComment = sortModule.sortTableNameOfComment(boardType);

  if(commentNo == 0){
    offsetSql = '';
  }else{
    offsetSql = 'AND a.created_at > (SELECT created_at FROM '+tableNameOfComment+' WHERE no=?)';
  }

    if(boardType == 'match'){
      var sql = 'SELECT a.no, a.article_no, a.area_name, a.writer_id, a.comment, a.blocked, a.created_at, b.nick_name, b.profile, b.profile_thumb FROM '+tableNameOfComment+
      ' AS a JOIN users AS b ON(a.writer_id = b.uid) WHERE a.article_no=? AND a.area_name=? '+offsetSql+' ORDER BY a.created_at ASC LIMIT 10';
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
      var sql = 'SELECT a.no, a.article_no, a.area_name, a.writer_id, a.comment, a.blocked, a.created_at, b.nick_name, b.profile, b.profile_thumb FROM '+tableNameOfComment+
      ' AS a JOIN users AS b ON(a.writer_id = b.uid) WHERE a.article_no=? '+offsetSql+' ORDER BY a.created_at ASC LIMIT 10';
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
* 댓글 삭제
*/
router.delete('/view/comment/delete/:boardType/:no/:articleNo/:areaNo', function(req, res){
  var boardType = req.params.boardType;
  var no = req.params.no;
  var articleNo = req.params.articleNo;
  var areaNo = req.params.areaNo;
  var tableNameOfComment = sortModule.sortTableNameOfComment(boardType);
  var tableNameOfArticle = sortModule.sortTableNameOfArticle(boardType, areaNo);

  var sql = 'DELETE FROM '+tableNameOfComment+' WHERE no=?';
  conn.query(sql, [no], function(err, result, fields){
    if(err){
      res.json({
        code : 500,
        message : 'Internal Server Error'
      });
    }else{
      //댓글 delete 성공 후 해당 게시글 Table에서 comment_Cnt를 -1 업데이트해준다.
      var sql = 'UPDATE '+tableNameOfArticle+' SET comment_cnt = comment_cnt -1 WHERE no=?';
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
          var sql = 'UPDATE MBoard SET comment_cnt = comment_cnt -1 WHERE no=?';
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
* match / hire / recruit의 게시글의 최근 업데이트 시간 리스트를 내려준다.
*/
router.get('/:boardType/updated', function(req, res){
  var boardType = req.params.boardType;
  var updateTableName = sortModule.sortUpdateTableName(boardType);
  var sql = 'SELECT * FROM '+updateTableName;

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
  var tableNameOfFavorite = sortModule.sortTableNameOfFavorite(boardType);

  if(favoriteState == 'Y'){
    //like
    var sql = 'INSERT INTO '+tableNameOfFavorite+' (article_no, uid, created_at) VALUES(?,?,?)';
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
    var sql = 'DELETE FROM '+tableNameOfFavorite+' WHERE uid =? AND article_no =?';
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

/*
* 게시글의 매칭 상태 변경
*/
router.put('/view/matchState/:areaNo/:no/:state', function(req, res){
  var areaNo = req.params.areaNo;
  var articleNo = req.params.no;
  var state = req.params.state;
  var updateTableName;

  if(areaNo < 9){
    //seoul
    updateTableName = 'MBoard_Seoul';
  }else if(areaNo > 9){
    //gyeong gi
    updateTableName = 'MBoard_Gyeonggi';
  }

  //Sub 테이블의 match_state의 상태를 변경해준다.
  var sql = 'UPDATE '+updateTableName+' SET match_state=? WHERE no=?';
  conn.query(sql, [state, articleNo], function(err, result, fields){
    if(err){
      console.log(err);
      res.json({
        code : 500,
        message : 'Internal Server Error'
      });
    }else{
      //서브 테이블의 match_state를 변경 후 부모테이블의 상태도 변경해준다.
      var sql = 'UPDATE MBoard SET match_state=? WHERE no=?';
      conn.query(sql, [state, articleNo], function(err, result, fields){
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
    }
  })
})

module.exports = router;
