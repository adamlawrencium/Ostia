var Poloniex = require('../exchanges/poloniexAPI.js');
var async_    = require('async');
var SMA       = require('../indicators/sma.js');
// Create a new instance
poloniex = new Poloniex();


var count = 0;
async_.whilst(
  function() { return count < 5000; },   // this will be replaced with a timer

  /* Body of whilst loop that polls data and produces orders */
  function(callback) {
    console.log('##########');

    /* poll and analyze returned exchange data */
    poloniex.getTicker(function(err, data) {
      console.log(data['USDT_BTC']);
      console.log();
      var parsedData = data['USDT_BTC'];

      var sma_10 = SMA(parsedData, 10);
      var sma_20 = SMA(parsedData, 20);

      if (sma_10 < sma_20) {

      }
      /* Trading logic here:
      1. calculate two moving averages
      2. if one is higher than the other, create order
      3. export indicator and order

      /* export orders and performance data */
      exports.financeData = parsedData;
      setTimeout(function() {
        callback(null, count);
      }, 2000);
    });
    count++;
  },

  function (err, n) {
    console.log("FINISHED");
  }
);
