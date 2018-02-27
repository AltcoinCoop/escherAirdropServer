var mongoose = require('mongoose');

var airdropSchema = mongoose.Schema({
  contract: {type: String, lowercase: true, unique: true}, //contract address
  startBlock: Number,
  endBlock: Number,
  totalClaimed: String, //in ubq
  lastBlock: Number //last block a sync occured
});

module.exports = mongoose.model('Airdrops', airdropSchema);
