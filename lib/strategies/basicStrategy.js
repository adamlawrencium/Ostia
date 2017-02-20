var Poloniex = require('poloniex.js');
var async = require('async');
var SMA = require('../indicators/sma.js');
var currencyPair = 'USDT_BTC';

// initialize poloniex wrapper
poloniex = new Poloniex();

/* THIS FUNCTION INITIALIZES THE TIME SERIES */
var math = require('mathjs');
var d = new Date();
var currentDate = Math.floor((d.getTime() / 1000));
var secsPerDay = 86400;
var numDays = 200 * secsPerDay;
var startDate = currentDate - numDays;
var period = 86400; // valid values: 300, 900, 1800, 7200, 14400, 86400
var currencyA = "USDT";
var currencyB = "BTC";
var endDate = 9999999999; // used as most recent time for Poloniex

/* Basic strategy
 * 1. Get the data
 * 2. Process data / calculate indicators
 * 3. Create an order
 */

/* Three waterfall functions:
 * 1. Request data from exchange (or DataHub in the future)
 * 2. Calcuate indicators
 * 3. Export data
 */

function generateIndicators(candlestickData, cb) {
  console.log('### computing indicators...');
  var indicators = {};
  indicators.SMA10 = SMA(candlestickData, 10);
  indicators.SMA20 = SMA(candlestickData, 30);
  cb(indicators);
}

async.waterfall([

  /* Initialze data */
  function (callback) {
    console.log('### requesting exchange data...');
    poloniex.returnChartData(currencyA, currencyB, period, startDate, endDate, function (err, response) {
      console.log('### exchange data (candlestick) received.');
      var candlestickData = [];
      if (err) {
        console.log("error!");
      }
      for (var i = 0; i < response.length; i++) {
        candlestickData.push(response[i]);
      }
      callback(null, candlestickData);
    });
  },

  function (candlestickData, callback) {
    generateIndicators(candlestickData, function (indicators) {
      console.log('### indicators generated:', indicators.SMA10[0], '...');
      exports.candlestickData = candlestickData;
      exports.indicators = indicators;
    });
    callback(null);
  }

], function (err, result) {
  // result now equals 'done'
});
