var Poloniex = require('../exchanges/poloniexAPI.js');
var async = require('async');

// Create a new instance
poloniex = new Poloniex();



var count = 0;
async.whilst(
  function() { return count < 5000; },   // this will be replaced with a timer
  function(callback) {
    count++;
    console.log('########## HI');
    poloniex.getTicker(function(err, data) {
      //console.log(data['USDT_BTC']);
      var parsedData = data['USDT_BTC'];
      exports.financeData = parsedData;

      setTimeout(function() {
        callback(null, count);
      }, 2000);
    });
  },

  function (err, n) {
    console.log("FINISHED");
  }
);
