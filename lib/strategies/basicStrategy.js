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

  //   var indicators = {};
  //   indicators.SMA10 = SMA(candlestickData, 10);
  //   indicators.SMA20 = SMA(candlestickData, 20);
  //   setTimeout( function() {
  //       console.log('IN BASIC STRAT - indicators',indicators);
  //   }, 10000);
  //
  //   callback(null, candlestickData, indicators);
  // },
  //
  // function(candlestickData, indicators, callback) {
  //   console.log('I GOT THE KEYEZ KEYEZ KEYEZ', indicators);
  //   exports.candlestickData = candlestickData;
  //   exports.indicators = indicators;
  //   callback(null);
  // }
], function (err, result) {
  // result now equals 'done'
});


// async.waterfall([
// /*
// 1. get candlestick data
// 2. calcuate SMAs
// 3. update data      [to be done later]
// 4. back to step 2   [to be done later]
// */
//   // Step 1.
//   function(callback) {
//     var candlestickData = [];
//     poloniex.returnChartData(currencyA,currencyB,period,startDate,endDate,function (err, response) {
//       if (err) {
//         console.log("error!");
//       }
//       console.log(response);
//       for (var i = 0; i < response.length; i++) {
//         candlestickData.push(response[i]);
//       }
//       //exports.initializedFinanceData = candlestickData;
//       console.log(candlestickData);
//     });
//     callback(null, candlestickData);
//   }
// //   ,
// //
// //   // Step 2.
// //   function(candlestickData, callback) {
// //     var SMA10 = SMA(candlestickData, 10);
// //     var SMA20 = SMA(candlestickData, 20);
// //     callback(null);
// //   }
// // ]
// , function (error, success) {
//     if (error) { alert('Something is wrong!'); }
//     console.log("DONE");
//   }
// );

//
// poloniex.returnChartData(currencyA,currencyB,period,startDate,endDate,function (err, response) {
//   if (err) {
//     console.log("error!");
//   }
//
//   var initializedTimeSeries = [];
//   for (var i = 0; i < response.length; i++) {
//     initializedTimeSeries.push(response[i]);
//   }
//   exports.initializedFinanceData = initializedTimeSeries;
//
//
//   /* THIS FUNCTION UPDATES TIME SERIES */
//   var count = 0;
//   // TODO: USE WATERFALL OR SERIES OR SOMETHING ELSE
//   async.whilst(
//     function () {
//       return count < 30;
//     }, // this will be replaced with a timer
//
//     /* Body of whilst loop that polls data and produces orders */
//     function (callback) {
//
//       /* poll and analyze returned exchange data */
//       poloniex.getTicker(function (err, data) {
//         var parsedData = data[currencyPair];
//
//         var sma_10 = SMA(parsedData, 10);
//         console.log("##### SMA DATA:");
//         console.log(sma_10);
//         //var sma_20 = SMA(parsedData, 20);
//
//         //if (sma_10 < sma_20) {
//
//         //}
//         /* Trading logic here:
//         1. calculate two moving averages
//         2. if one is higher than the other, create order
//         3. export indicator and order
//
//         /* export orders and performance data */
//         exports.updatedFinanceData = parsedData;
//         //exports.indicators.sma.ten =
//         //console.log(exports.updatedFinanceData);
//         //console.log('STRATEGY - Updated response:\n',exports.updatedFinanceData);
//         //console.log();
//         setTimeout(function () {
//           callback(null, count);
//         }, 2000);
//       });
//       count++;
//     },
//
//     function (err, n) {
//       console.log("FINISHED");
//     }
//   );
// });
