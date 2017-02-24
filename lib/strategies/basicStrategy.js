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

function historicalTrader(candlestickData) {
  // loop through candlestickData and find historical trade opportunities
  // then return a list of those opportunities according to highchart's flag needs
}


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
  },

  // TRADE LOGIC HERE. This function find past trade opportunities.
  function(callback) {
    var smallerWindowSMA = exports.indicators.SMA10;    // smaller window contains more data points
    var largerWindowSMA = exports.indicators.SMA20;     // larger window contains less data points

    // trim beginning of the longer series
    for (var i = 0; i < smallerWindowSMA.length; i++) {
      if (smallerWindowSMA[i][0] == largerWindowSMA[0][0]) {
        smallerWindowSMA = largerWindowSMA.slice(i, largerWindowSMA.length);
      }
    }
    if (! smallerWindowSMA.length == largerWindowSMA.length) { console.log('INDICATOR SERIES NOT SAME LENGTH!');}

    // determine current state of both indicators -- which is above the other
    // TODO: this is a naive approach. Perhaps calculate crossovers first, then assign buy or sell labels
    var upperIndicator = null;
    var lowerIndicator = null;
    var flagsArray = [];
    if (smallerWindowSMA[0][1] < largerWindowSMA[0][1]) {
      lowerIndicator = smallerWindowSMA;
      upperIndicator = largerWindowSMA;
      var periodItr = 0;
      while (periodItr < largerWindowSMA.length) {
        if (smallerWindowSMA[periodItr][1] > largerWindowSMA[periodItr][1]) {   // the moment they switch, record
          
        }
      }
    } else {
      lowerIndicator = largerWindowSMA;
      upperIndicator = smallerWindowSMA;
      var periodItr = 0;
      while (periodItr < largerWindowSMA.length) {

      }
    }

    // now we run through both series and record when they cross



    callback(null);
  },

  /* Pull Live Data from Poloniex package every second */
  function (callback) {
    setInterval(function() {
      poloniex.returnTicker(function(err, data) {
          lastTickerData = data['USDT_BTC']['last'];
          exports.updatedFinanceData = lastTickerData;
      });
    }, 1000);

  }

], function (err, result) {
  // result now equals 'done'
});
