'use strict';

var Web3 = require('web3');
var config = require('../lib/config');
var db = require('../lib/database');
var lib = require('../lib/common');
var BigNumber = require('bignumber.js');
var web3 = new Web3(new Web3.providers.HttpProvider('http://' + config.gubiq));

const abi = [{"constant":true,"inputs":[],"name":"endBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"claimersCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"startBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"claim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"offset","type":"uint256"},{"name":"limit","type":"uint256"}],"name":"getClaimers","outputs":[{"name":"_claimers","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"claimers","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"claims","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_startBlock","type":"uint256"},{"name":"_endBlock","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"claimer","type":"address"}],"name":"onClaim","type":"event"}];

var getContract = function(abi, address, cb) {
  return cb(web3.eth.contract(abi).at(address));
};

var totalClaimed = new BigNumber(0);

setTimeout(function(){
  if (!web3.isConnected()) {
    console.log('no web3 connection.')
    process.exit();
  } else {
    var airdrop = process.argv[2];
    db.connect(config.mongodb, function() {
      db.getAirdrop(airdrop.toLowerCase(), function(airdrop_) {
        if (!airdrop_) {
          db.disconnect();
          console.log('Airdrop: ' + airdrop + ' not found in db');
          process.exit();
        } else {
          getContract(abi, airdrop_.contract, function(contract) {
            web3.eth.getBlockNumber(function(err, currentBlock) {
              if (currentBlock > airdrop_.endBlock) {
                web3.eth.defaultBlock = airdrop_.endBlock;
              } else {
                web3.eth.defaultBlock = currentBlock;
              }
              var claimers = contract.getClaimers(0, new BigNumber(contract.claimersCount()).toNumber());
              lib.syncLoop(claimers.length, function(loop) {
                var i = loop.iteration();
                totalClaimed = new BigNumber(totalClaimed).plus(web3.eth.getBalance(claimers[i]));
                db.updateClaim(airdrop, claimers[i].toString(), {
                  address: claimers[i].toString(),
                  balance: web3.fromWei(new BigNumber(web3.eth.getBalance(claimers[i])).toString(), 'ether').toString(),
                  airdrop: airdrop
                }, function(err) {
                  loop.next();
                });
              }, function() {
                db.updateAirdrop(airdrop_.contract, {
                  totalClaimed: web3.fromWei(totalClaimed.toString()),
                  lastBlock: web3.eth.defaultBlock
                }, function(){
                  db.disconnect();
                });
              });
            });
          });
        }
      });
    });
  }
}, 1000);
