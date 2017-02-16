/* SIMPLE MOVING AVERAGE INDICATOR AND ALGORITHM

To calculate an simple moving average, we simply need time-series data:
1, 52
2, 53.7
3, 57.3
4, 60.1
5, 62.9
...
For every new point (Date, value) that is added, the moving average substracts
the oldest value, adds the new one, then divides the set by the specified
period again.

Our set up as of now creates an issue however -- we don't have historical data.
Therefore we can't calculate a SMA with a period longer than the time the
the strategy has been running...

To deal with this I suggest we call an exchanges API for historical data, then
append on new points as the strategy runs.

With this said, once we have a proper data set that we called from an API, we
can append that dataset to our own set:
Start:          [[1,2],[2,2.4],...]   +    [ empty ]
Poloniex data   --->  our data set

Next iteration: [[1,2],[2,2.4],...]   +    [ 3,2.9 ]
Our data        --->   new point


Now, how this will integrate into our TradingDesk is another question...

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
sma.js Specifications
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
All these indicators should calculate an answer given a universal input. That
means that the inputs need to be standardized.
In order for SMA to work, it needs time-series data and one more data point.

INPUTS:

*/

'use strict';
/*

currencyPair:   currency pair to return
period:         candlestick period in seconds; valid values are 300, 900, 1800, 7200, 14400, and 86400
start:          are given in UNIX timestamp format and used to specify the date range for the data returned
end:            "

Call: https://poloniex.com/public?command=returnChartData&currencyPair=BTC_XMR&start=1405699200&end=9999999999&period=14400

returns:
[{"date":   1405699200,
"high":   0.0045388,
"low":    0.00403001,
"open":   0.00404545,
"close":  0.00427592,
"volume": 44.11655644,
"quoteVolume":     10259.29079097,
"weightedAverage": 0.00430015},
...]
*/

var printSeries = function(series) {
  for (var i = 0; i < series.length; i++) {
    console.log('[' + series[i] + ']' + ',');
  }
}

var getPoloniexCandleStickData = function(currencyA,currencyB,period,startDate,endDate) {
  var Poloniex = require('poloniex.js');
  var poloniex = new Poloniex();
  poloniex.returnChartData(currencyA,currencyB,period,startDate,endDate,function (err, response) {
    if (err) {
      console.log("error!");
    }
    var candleStickData = [];
    for (var i = 0; i < response.length; i++) {
      candleStickData.push(response[i]);
    }
    return candleStickData;
  });
}


var SMA = function(timeSeries, timeFrame) {
  var math = require('mathjs');
  var Poloniex = require('poloniex.js');
  var poloniex = new Poloniex();
  var async = require('async');

  var d = new Date();
  var currentDate = Math.floor((d.getTime() / 1000));
  var secsPerDay  = 86400;
  var numDays     = 500 * secsPerDay;
  var startDate   = currentDate - numDays;

  var MAWindowSize = 10;        // N-day moving average

  // Call historical data and add (date,closingPrice) pairs to closingPriceTimeSeries;
  var closingPriceTimeSeries = [];
  var MATimeSeries = [];

  async.waterfall([
    function(callback) {
      var candleStickData = getPoloniexCandleStickData("USDT", "BTC", 86400, startDate, 9999999999);
      callback(null, candleStickData);
    },
    function(closingPriceTimeSeries) {
      var MATimeSeries = [];
      var closingPriceTimeSeries = [];
      for (var i = 0; i < response.length; i++) {
        closingPriceTimeSeries.push([response[i].date, response[i].close]);
      }
      for (var i = 0; i < closingPriceTimeSeries.length; i++) {
        if (i == MAWindowSize) {
          var avg = 0;
          for (var i = 0; i < MAWindowSize; i++) {
            avg += closingPriceTimeSeries[i][1] / MAWindowSize;
          }
          MATimeSeries.push([closingPriceTimeSeries[i][0],avg]);
        }
        else if (i > MAWindowSize) {
          var nextValue = MATimeSeries[MATimeSeries.length-1][1];
          nextValue += closingPriceTimeSeries[i][1] / MAWindowSize;
          nextValue -= closingPriceTimeSeries[i-MAWindowSize][1] / MAWindowSize;
          MATimeSeries.push([closingPriceTimeSeries[i][0],nextValue]);
        }
      }
      callback(null, MATimeSeries);
    }
  ], function(err, MATimeSeries) {
    printSeries(MATimeSeries);
    exports.MATimeSeries = MATimeSeries;
  }
);

/*
poloniex.returnChartData("USDT", "BTC", 86400, startDate, 9999999999, function(err, response) {
if (err) {
console.log("error!");
}
for (var i = 0; i < response.length; i++) {
closingPriceTimeSeries.push([response[i].date, response[i].close]);
}
for (var i = 0; i < closingPriceTimeSeries.length; i++) {
if (i == MAWindowSize) {
var avg = 0;
for (var i = 0; i < MAWindowSize; i++) {
avg += closingPriceTimeSeries[i][1] / MAWindowSize;
}
MATimeSeries.push([closingPriceTimeSeries[i][0],avg]);
}
else if (i > MAWindowSize) {
var nextValue = MATimeSeries[MATimeSeries.length-1][1];
nextValue += closingPriceTimeSeries[i][1] / MAWindowSize;
nextValue -= closingPriceTimeSeries[i-MAWindowSize][1] / MAWindowSize;
MATimeSeries.push([closingPriceTimeSeries[i][0],nextValue]);
}
}

// printSeries(MATimeSeries);
// console.log();
// printSeries(closingPriceTimeSeries);

});
return [MATimeSeries, closingPriceTimeSeries];
*/
}

SMA();

module.exports = SMA;
