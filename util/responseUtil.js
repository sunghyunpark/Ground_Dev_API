var jwt = require('jsonwebtoken');

var responseUtil = {};

responseUtil.successTrue = function(){
  return {
    code : 200,
    message : 'Success'
  };
};

responseUtil.successTrueWithData = function(result){
  return {
    code : 200,
    message : 'Success',
    result : result
  };
};

responseUtil.successFalse = function(errCode, message){
  return {
    code : errCode,
    message : message
  };
};

responseUtil.isLoggedIn = function(req, res, next){
  var token = req.headers['x-access-token'];
  if(!token){
    return res.json(responseUtil.successFalse(500, 'token is required!'));
  }else{
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
      if(err){
        return res.json(responseUtil.successFalse(500, err));
      }else{
        req.decoded = decoded;
        next();
      }
    });
  }
};

module.exports = responseUtil;
