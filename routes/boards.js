require('date-utils');
require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var router = express.Router();
var sortModule = require('../util/matchSortModule');
var responseUtil = require('../util/responseUtil');
var fcmModule = require('../util/fcmModule');
var Promise = require('bluebird');

var conn = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});
conn.connect();

/*
* POST 매치 게시글 등록
* match / hire, recruit 로 나뉜다.(match의 경우 MBoard와 SubTable이 나뉘어져 있어서 분기처리 때문)
* match, hire 게시글이 등록되면 원하는 날짜 및 지역을 설정해둔 사용자들에게는 fcm 푸시가 전송된다.
*/
router.post('/', function(req, res){
  var areaNo = req.body.areaNo;
  var uid = req.body.uid;
  var title = req.body.title;
  var contents = req.body.contents;
  var boardType = req.body.boardType;
  var matchDate = req.body.matchDate;
  var averageAge = req.body.averageAge;
  var charge = req.body.charge;
  var playRule = req.body.playRule;
  var currentTime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
  var tableName = sortModule.sortTableNameOfArticle(boardType, areaNo);
  var updateTableName = sortModule.sortUpdateTableName(boardType);

  // boardType이 match인 경우
  if(boardType == 'match'){
    new Promise(function(resolve, reject){    // MBoard에 먼저 insert를 해준다.
      var sql = 'INSERT INTO MBoard (area_no, writer_id, title, contents, match_date, average_age, charge, play_rule, created_at) VALUES(?,?,?,?,?,?,?,?,?)';
      conn.query(sql, [areaNo, uid, title, contents, matchDate, averageAge, charge, playRule, currentTime], function(err, result, fields){
        if (err) reject(err);
        else resolve(result);
      });
    })
    .then(function(result){
      fcmModule.getMatchDateAlarmFcmToken(result.insertId, areaNo, boardType, matchDate);    // 원하는 날짜 및 지역 게시글 등록 시 푸시 설정한 사용자들에게만 푸시 전송

      return new Promise(function(resolve, reject){    // MBoard의 subTable인 MBoard_Seoul 혹은 MBoard_Gyeonggi에도 insert를 해준다.
        var sql = 'INSERT INTO '+tableName+' (no, area_no, writer_id, title, contents, match_date, average_age, charge, play_rule, created_at) VALUES(?,?,?,?,?,?,?,?,?,?)';
        conn.query(sql, [result.insertId, areaNo, uid, title, contents, matchDate, averageAge, charge, playRule, currentTime], function(err, result, fields){
          if (err) reject(err);
          else resolve(areaNo);
        })
      })
    })
    .then(function(areaNo){
      return new Promise(function(resolve, reject){    // MBoardUpdate에 업데이트 날짜를 수정한다.
        var sql = 'UPDATE MBoardUpdate SET updated_at=? WHERE area_no=?';
        conn.query(sql, [currentTime, areaNo], function(err, result, fields){
          if (err) reject(err);
          else res.json(responseUtil.successTrue('Success'));
        })
      })
    })
    .catch(function(err){    // reject의 경우
      console.log(err);
    })
  }else{    // hire/recruit 인 경우
    new Promise(function(resolve, reject){
      var sql;
      var sqlValueArray;

      if(boardType == 'hire'){
        sql = 'INSERT INTO '+tableName+' (area_no, writer_id, title, contents, match_date, created_at) VALUES(?,?,?,?,?,?)';
        sqlValueArray = [areaNo, uid, title, contents, matchDate, currentTime]
      }else{
        sql = 'INSERT INTO '+tableName+' (area_no, writer_id, title, contents, created_at) VALUES(?,?,?,?,?)';
        sqlValueArray = [areaNo, uid, title, contents, currentTime]
      }
      conn.query(sql, sqlValueArray, function(err, result, fields){
        if (err) reject(err);
        else resolve(result);
      })
    })
    .then(function(result){
      if(boardType == 'hire'){
        fcmModule.getMatchDateAlarmFcmToken(result.insertId, areaNo, boardType, matchDate);    // 원하는 날짜 및 지역 게시글 등록 시 푸시 설정한 사용자들에게만 푸시 전송
      }
      return new Promise(function(resolve, reject){
        conn.query('UPDATE '+updateTableName+' SET updated_at=? WHERE area_no=?',
        [currentTime, areaNo], function(err, result, fields){
          if (err) reject(err);
          else res.json(responseUtil.successTrue('Success'));
        })
      })
    })
    .catch(function(err){
      console.log(err);
    })
  }
})

/**
* [게시판 글 수정]
* boardType을 가지고 분기처리 후 그에 맞게 Update문을 실행한다.
*/
router.put('/edit', function(req, res){
  var boardType = req.body.boardType;
  var areaNo = req.body.areaNo;
  var no = req.body.no;
  var title = req.body.title;
  var contents = req.body.contents;
  var matchDate = req.body.matchDate;
  var averageAge = req.body.averageAge;
  var charge = req.body.charge;
  var playRule = req.body.playRule;
  var tableName = sortModule.sortTableNameOfArticle(boardType, areaNo);

  if(boardType == 'match'){
    var sql = 'UPDATE MBoard SET title=?, contents=?, match_date=?, average_age=?, charge=?, play_rule=? WHERE no=?';
    conn.query(sql, [title, contents, matchDate, averageAge, charge, playRule, no], function(err, result, fields){
      if(err){
        console.log(err);
        res.json(responseUtil.successFalse(500, 'Internal Server Error'));
      }else{
        var sql = 'UPDATE '+tableName+' SET title=?, contents=?, match_date=?, average_age=?, charge=?, play_rule=? WHERE no=?';
        conn.query(sql, [title, contents, matchDate, averageAge, charge, playRule, no], function(err, result, fields){
          res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrue('Success'));
        })
      }
    })
    return;
  }

  var sql = 'UPDATE '+tableName+' SET title=?, contents=? WHERE no=?';
  conn.query(sql, [title, contents, no], function(err, result, fields){
    if(err){
      console.log(err);
      res.json(responseUtil.successFalse(500, 'Internal Server Error'));
    }else{
      res.json(responseUtil.successTrue('Success'));
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
  // hire, recruit 의 경우엔 areaNo가 필요없어서 0값으로 넣어준다.
  var tableName = (boardType == 'match') ? 'MBoard' : sortModule.sortTableNameOfArticle(boardType, 0);

  var sql = 'DELETE FROM '+tableName+' WHERE no=? AND writer_id=?';
  conn.query(sql, [no, uid], function(err, result, fields){
    res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrue('Success'));
  })
})

/*
* [게시판 목록]
* 상세 지역 > 게시판 List를 내려준다.
*/
router.get('/:boardType/:areaNo/:no/:order/:matchDate', function(req, res){
  var no = req.params.no;
  var areaNo = req.params.areaNo;
  var boardType = req.params.boardType;
  var order = req.params.order;
  var matchDate = req.params.matchDate;
  var tableName = sortModule.sortTableNameOfArticle(boardType, areaNo);
  var offsetSql = (no == 0) ? '' : 'AND article.created_at < (SELECT created_at FROM '+tableName+' WHERE no='+no+')';
  var matchData = sortModule.sortMatchData(boardType);
  var orderData;

  if(order == 'all'){
    orderData = '';
  }else if(order == 'matchDate'){
    orderData = 'AND article.match_date=?';
  }else if(order == 'matchState'){
    orderData = 'AND article.match_state=\'N\'';
  }

  var sql = 'SELECT article.no, '+
  'article.board_type AS matchBoardType, '+
  'article.area_no AS areaNo, '+
  'article.writer_id AS writerId, '+
  'article.title, '+
  'article.contents, '+
  'article.match_state AS matchState, '+
  'article.blocked, '+
  'article.view_cnt AS viewCnt, '+
  'article.comment_cnt AS commentCnt, '+
  matchData+' article.created_at AS createdAt, '+
  'users.nick_name AS nickName, '+
  'users.profile, '+
  'users.profile_thumb AS profileThumb '+
  'FROM '+ tableName + ' AS article JOIN users AS users ON(article.writer_id=users.uid) WHERE article.area_no=? '+
  offsetSql+orderData+' ORDER BY article.created_at DESC LIMIT 10';

  conn.query(sql, [areaNo, matchDate], function(err, result, fields){
    res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrueWithData(result));
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
router.get('/list/detailView/favorite/:boardType/:areaNo/:no/:uid', function(req, res){
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
          res.json(responseUtil.successFalse(500, 'Internal Server Error'));
        }else{
          // MBoard에 해당 게시글의 조회수 업데이트 후 분기처리된 Table의 게시판 조회수를 +1하도록 update 쿼리를 수행한다.
          var sql = 'UPDATE '+tableName+' SET view_cnt = view_cnt +1 WHERE no=?';
          conn.query(sql, [no], function(err, result, fields){
            if(err){
              //조회수 쿼리 실패
              console.log(err);
              res.json(responseUtil.successFalse(500, 'Internal Server Error'));
            }else{
              // 조회수 쿼리 성공 시 해당 게시글의 etc data를 내려준다.
              var sql = 'SELECT EXISTS (SELECT * FROM MBFavorite where article_no=? AND uid=?) AS favoriteState';
              conn.query(sql, [no, uid], function(err, result, fields){
                if(err){
                  console.log(err);
                  res.json(responseUtil.successFalse(500, 'Internal Server Error'));
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
        res.json(responseUtil.successFalse(500, 'Internal Server Error'));
      }else{
        // 조회수 쿼리 성공 시 해당 게시글의 데이터를 받아온다.
        var sql = 'SELECT EXISTS (SELECT * FROM '+tableNameOfFavorite+' where article_no=? AND uid=?) AS favoriteState';
        conn.query(sql, [no, uid], function(err, result, fields){
          if(err){
            console.log(err);
            res.json(responseUtil.successFalse(500, 'Internal Server Error'));
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
* 스키마, 푸시, 댓글 탭하여 상세 게시글 이동에 사용된다.    /list/detailView/:boardType/:areaNo/:no/:uid
*/
router.get('/list/detailView/:boardType/:areaNo/:no/:uid', function(req, res){
  var boardType = req.params.boardType;
  var areaNo = req.params.areaNo;
  var no = req.params.no;
  var uid = req.params.uid;

  var tableNameOfArticle = sortModule.sortTableNameOfArticle(boardType, areaNo);
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
          res.json(responseUtil.successFalse(500, 'Internal Server Error'));
        }else{
          // MBoard에 해당 게시글의 조회수 업데이트 후 분기처리된 Table의 게시판 조회수를 +1하도록 update 쿼리를 수행한다.
          var sql = 'UPDATE '+tableNameOfArticle+' SET view_cnt = view_cnt +1 WHERE no=?';
          conn.query(sql, [no], function(err, result, fields){
            if(err){
              //조회수 쿼리 실패
              console.log(err);
              res.json(responseUtil.successFalse(500, 'Internal Server Error'));
            }else{
              // 조회수 쿼리 성공 시 해당 게시글의 데이터를 받아온다.
              var sql = 'SELECT article.no, '+
              'article.board_type AS matchBoardType, '+
              'article.area_no AS areaNo, '+
              'article.writer_id AS writerId, '+
              'article.title, '+
              'article.contents, '+
              'article.match_state AS matchState, '+
              'article.blocked, '+
              'article.view_cnt AS viewCnt, '+
              'article.match_date AS matchDate, '+
              'article.average_age AS averageAge, '+
              'article.charge, '+
              'article.play_rule AS playRule, '+
              'article.created_at AS createdAt, '+
              'users.nick_name AS nickName, '+
              'users.profile, '+
              'users.profile_thumb AS profileThumb, '+
              '(SELECT EXISTS (SELECT * FROM MBFavorite where article_no=? AND uid=?)) AS favoriteState FROM '+
              tableNameOfArticle+' AS article JOIN users AS users ON(article.writer_id = users.uid) WHERE article.no=?';
              conn.query(sql, [no, uid, no], function(err, result, fields){
                if(err){
                  console.log(err);
                  res.json(responseUtil.successFalse(500, 'Internal Server Error'));
                }else{
                  console.log(result[0].createdAt);
                  res.json(responseUtil.successTrueWithData(result));
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
        res.json(responseUtil.successFalse(500, 'Internal Server Error'));
      }else{
        // 조회수 쿼리 성공 시 해당 게시글의 데이터를 받아온다.
        var sql = 'SELECT article.no, '+
        'article.board_type AS matchBoardType, '+
        'article.area_no AS areaNo, '+
        'article.writer_id AS writerId, '+
        'article.title, '+
        'article.contents, '+
        'article.match_state AS matchState, '+
        'article.blocked, '+
        'article.view_cnt AS viewCnt, '+
        'article.created_at AS createdAt, '+
        'users.nick_name AS nickName, '+
        'users.profile, '+
        'users.profile_thumb AS profileThumb, '+
        '(SELECT EXISTS (SELECT * FROM '+tableNameOfFavorite+' where article_no=? AND uid=?)) AS favoriteState FROM '+
        tableNameOfArticle+' AS article JOIN users AS users ON(article.writer_id = users.uid) WHERE article.no=?';
        conn.query(sql, [no, uid, no], function(err, result, fields){
          if(err){
            console.log(err);
            res.json(responseUtil.successFalse(500, 'Internal Server Error'));
          }else{
            console.log(result[0].createdAt);
            res.json(responseUtil.successTrueWithData(result));
          }
        })
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
      res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrue());
    })
  }else{
    //not like
    var sql = 'DELETE FROM '+tableNameOfFavorite+' WHERE uid =? AND article_no =?';
    conn.query(sql, [uid, articleNo], function(err, result, fields){
      res.json(err ? responseUtil.successFalse(500, 'Internal Server Error') : responseUtil.successTrue());
    })
  }
})

/*
* 게시글의 매칭 상태 변경
*/
router.put('/view/matchState', function(req, res){
  var areaNo = req.body.areaNo;
  var articleNo = req.body.no;
  var state = req.body.state;
  var boardType = req.body.boardType;
  var tableName = sortModule.sortTableNameOfArticle(boardType, areaNo);
  var tableNameOfFavorite = sortModule.sortTableNameOfFavorite(boardType);

  if(boardType == 'match'){
    // 매치 게시글인 경우 부모 테이블에 업데이틀 해준다.
    var sql = 'UPDATE MBoard SET match_state=? WHERE no=?';
    conn.query(sql, [state, articleNo], function(err, result, fields){
      if(err){
        res.json(responseUtil.successFalse(500, 'Internal Server Error'));
      }else{
        console.log('Parent Table Update Success');
      }
    })
  }

  //Mboard 의 서브 테이블, HBoard, RBoard 에 업데이트를 해준다.
  var sql = 'UPDATE '+tableName+' SET match_state=? WHERE no=?';
  conn.query(sql, [state, articleNo], function(err, result, fields){
    if(err){
      console.log(err);
      res.json(responseUtil.successFalse(500, 'Internal Server Error'));
    }else{
      res.json(responseUtil.successTrue('Success'));
      // 해당 게시글을 관심했던 사용자들의 fcmToken 추출
      if(state == 'Y'){
        var sql = 'SELECT b.fcm_token FROM '+tableNameOfFavorite+' AS a JOIN users AS b ON(a.uid=b.uid) WHERE a.article_no=?';
        conn.query(sql, [articleNo], function(err, result, fields){
          if(err){
            console.log(err);
            console.log('push error favorite article is matched!');
            res.json(responseUtil.successFalse(500, 'Internal Server Error'));
          }else{
              Object.keys(result).forEach(function(key){
              var row = result[key];
              console.log(row.fcm_token);
              fcmModule.sendPushMatchArticleOfFavorite(row.fcm_token, articleNo, areaNo, boardType);
            })
            //console.log(result[1].fcm_token);
            console.log('success to favorite article is matched!');
          }
        })
      }
    }
  })
})

module.exports = router;
