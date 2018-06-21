var express = require('express');
var router = express.Router

var user = require('./users.js');

router.post('/register', user.create);

module.exports = router;
