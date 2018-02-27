var mongoose = require('mongoose');
var Airdrop = require('../models/airdrop');
var Claim = require('../models/claim');

module.exports = {

  connect: function(dbparams, cb) {
    var dbstring = 'mongodb://' + dbparams.user;
    dbstring = dbstring + ':' + dbparams.password;
    dbstring = dbstring + '@' + dbparams.address;
    dbstring = dbstring + ':' + dbparams.port;
    dbstring = dbstring + '/' + dbparams.database;

    mongoose.connect(dbstring, function(err) {
      if (err) {
        console.log('Unable to connect to database: %s', dbstring);
        console.log('Aborting');
        process.exit(1);

      }
      console.log('Successfully connected to database: %s', dbparams.database);
      return cb();
    });
  },

  disconnect: function(){
    mongoose.disconnect();
  },

  // store contract info in db
  addAirdrop: function(params, cb) {
    var newAirdrop = new Airdrop(params);
    newAirdrop.save(function(err) {
      if (err) {
        return cb(err);
      } else {
        return cb(null);
      }
    });
  },

  getAirdrop: function(address, cb) {
    Airdrop.findOne({contract: address}, function(err, airdrop) {
      if (err) {
        return cb(null);
      } else {
        return cb(airdrop);
      }
    });
  },

  updateAirdrop: function(address, params, cb) {
    Airdrop.updateOne({contract: address}, {$set: params}, function(err) {
      return cb();
    });
  },

  updateClaim: function(airdrop, address, params, cb) {
    Claim.updateOne({airdrop: airdrop, address: address}, params, {upsert: true}, function(err) {
      return cb();
    });
  },

  getClaims: function(airdrop, cb) {
    Claim.find({airdrop: airdrop}, function(err, claims) {
      if (err) {
        return cb(null);
      } else {
        return cb(claims);
      }
    });
  }
};
