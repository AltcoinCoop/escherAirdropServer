var express = require('express');
var router = express.Router();

var config = require('../lib/config');
var db = require('../lib/database');
var validator = require('validator');

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.get('/getairdrop/:contract', function(req, res, next) {
  if (validator.matches(req.params['contract'], /^0x[0-9a-fA-F]{40}$/i)) {
    db.getAirdrop(req.params['contract'], function(airdrop) {
      res.json(airdrop);
    });
  } else {
    res.json({});
  }
});

router.get('/getclaims/:contract', function(req, res, next) {
  if (validator.matches(req.params['contract'], /^0x[0-9a-fA-F]{40}$/i)) {
    db.getClaims(req.params['contract'], function(claims) {
      res.json(claims);
    });
  } else {
    res.json({});
  }
});

module.exports = router;
