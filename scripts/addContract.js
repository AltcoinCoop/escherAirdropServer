'use strict';

var Web3 = require('web3');
var config = require('../lib/config');
var db = require('../lib/database');
var BigNumber = require('bignumber.js');
var web3 = new Web3(new Web3.providers.HttpProvider('http://' + config.gubiq));

const abi = [ { "constant": true, "inputs": [], "name": "endBlock", "outputs": [ { "name": "", "type": "uint256", "value": "400000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "claimersCount", "outputs": [ { "name": "", "type": "uint256", "value": "1" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "startBlock", "outputs": [ { "name": "", "type": "uint256", "value": "300000" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "claim", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "offset", "type": "uint256" }, { "name": "limit", "type": "uint256" } ], "name": "getClaimers", "outputs": [ { "name": "_claimers", "type": "address[]", "value": [] } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "claimers", "outputs": [ { "name": "", "type": "address", "value": "0xda904bc07fd95e39661941b3f6daded1b8a38c71" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "claims", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [ { "name": "_startBlock", "type": "uint256", "index": 0, "typeShort": "uint", "bits": "256", "displayName": "&thinsp;<span class=\"punctuation\">_</span>&thinsp;start Block", "template": "elements_input_uint", "value": "300000" }, { "name": "_endBlock", "type": "uint256", "index": 1, "typeShort": "uint", "bits": "256", "displayName": "&thinsp;<span class=\"punctuation\">_</span>&thinsp;end Block", "template": "elements_input_uint", "value": "400000" } ], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "claimer", "type": "address" } ], "name": "onClaim", "type": "event" } ];

var getContract = function(abi, address, cb) {
  return cb(web3.eth.contract(abi).at(address));
};

setTimeout(function(){
  if (!web3.isConnected()) {
    console.log('no web3 connection.')
    process.exit();
  } else {
    getContract(abi, process.argv[2], function(contract) {
      db.connect(config.mongodb, function() {
        db.addAirdrop({
          contract: process.argv[2],
          startBlock: new BigNumber(contract.startBlock()).toNumber(),
          endBlock: new BigNumber(contract.endBlock()).toNumber(),
          totalClaimed: '0',
          lastblock: '0'
        }, function(err) {
          if (err) {
            console.log('unable to save contract in db');
            console.log(err);
            db.disconnect();
          } else {
            console.log('contract added successfully');
            db.disconnect();
          }
        });
      });
    });
  }
}, 1000);
