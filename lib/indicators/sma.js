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

//var oneMonthFromNow = new Date((+new Date) + 2578400000);
//console.log(oneMonthFromNow);

var SMA = function() {
  // API Wrapper class
  var Poloniex = require('poloniex.js');
  var poloniex = new Poloniex();

  // Create time frame for API call below
  var d                 = new Date();
  var endDate           = Math.floor(d.getTime() / 1000);
  var timeFrame         = 350;             // timeFrame days
  var MAWindowSize      = 40;              // 30-day moving average
  var secsPerDay        = 86400;
  // need 2 multiplier to calculate SMA for first point
  var startDate         = endDate - (timeFrame * secsPerDay * 2);

  // Call historical data and add (date,closingPrice) pairs to closingPriceTimeSeries;
  var closingPriceTimeSeries      = [];
  var SMATimeSeries = [];

  poloniex.returnChartData("USDT", "BTC", 86400, startDate, endDate, function(err, response) {
    if (err) {
      console.log("error!");
    }

    /* Parsing response */
    for (var i = 0; i < response.length; i++) {
      closingPriceTimeSeries.push([response[i].date, response[i].close]);
    }

    /* Creating initial moving average window */
    var movingWindow = [];
    for (var i = 0; i < MAWindowSize; i++) {
      movingWindow.push(closingPriceTimeSeries[i]);
    }
    var movingAverage = 0;
    for (var i = 0; i < movingWindow.length; i++) {
      movingAverage += movingWindow[i][1];
    }
    movingAverage = movingAverage / MAWindowSize;
    console.log('movingAverage', movingAverage);

    /* Calculating moving average thereafter */
    SMATimeSeries.push([closingPriceTimeSeries[MAWindowSize][0],movingAverage]);
    for (var i = MAWindowSize+1; i < closingPriceTimeSeries.length; i++) {
      movingAverage *= MAWindowSize; console.log('movingAverage', movingAverage);
      movingAverage -= movingWindow.shift()[1]; console.log('movingAverage', movingAverage);
      movingWindow.push(closingPriceTimeSeries[i][1]);
      movingAverage += closingPriceTimeSeries[i][1];console.log('movingAverage', movingAverage);
      movingAverage /= MAWindowSize;console.log('movingAverage', movingAverage);
      SMATimeSeries.push([closingPriceTimeSeries[i][0],movingAverage]);
      console.log(i);
      console.log();
    }

    //console.log(SMATimeSeries);
    for (var i = 0; i < SMATimeSeries.length; i++) {
      //console.log(SMATimeSeries[i]);
    }
    console.log();
    for (var i = 0; i < closingPriceTimeSeries.length; i++) {
      //console.log(closingPriceTimeSeries[i]);
    }
    //console.log();
    //console.log(closingPriceTimeSeries);
    //console.log(SMATimeSeries.length);

  });
  return [SMATimeSeries, closingPriceTimeSeries];
}

// naive implementation
var SMA2 = function() {
  var math = require('mathjs');
  var Poloniex = require('poloniex.js');
  var poloniex = new Poloniex();

  var d = new Date();
  var currentDate = Math.floor((d.getTime() / 1000));
  var secsPerDay  = 86400;
  var numDays     = 500 * secsPerDay;
  var startDate   = currentDate - numDays;

  var MAWindowSize = 10;        // N-day moving average

  // Call historical data and add (date,closingPrice) pairs to closingPriceTimeSeries;
  var closingPriceTimeSeries = [];
  var MATimeSeries = [];

  poloniex.returnChartData("USDT", "BTC", 86400, startDate, 9999999999, function(err, response) {
    if (err) {
      console.log("error!");
    }
    //console.log(response);
    for (var i = 0; i < response.length; i++) {
      closingPriceTimeSeries.push([response[i].date, response[i].close]);
    }
    console.log(closingPriceTimeSeries);

    for (var i = 0; i < closingPriceTimeSeries.length; i++) {
      console.log("i",i);
      if (i == MAWindowSize) {
        var avg = 0;
        for (var i = 0; i < MAWindowSize; i++) {
          avg += closingPriceTimeSeries[i][1] / MAWindowSize;
        }
        console.log(avg);
        MATimeSeries.push([closingPriceTimeSeries[i][0],avg]);
        //console.log(closingPriceTimeSeries[5]);
        //console.log(MATimeSeries);
      }
      else if (i > MAWindowSize) {
        //console.log('TS',MATimeSeries);
        var nextValue = MATimeSeries[MATimeSeries.length-1][1];
        nextValue += closingPriceTimeSeries[i][1]               / MAWindowSize;
        nextValue -= closingPriceTimeSeries[i-MAWindowSize][1]  / MAWindowSize;
        MATimeSeries.push([closingPriceTimeSeries[i][0],nextValue]);
      }
    }

    //console.log(MATimeSeries);
    for (var i = 0; i < MATimeSeries.length; i++) {
      console.log('[' + MATimeSeries[i] + ']' + ',');
    }
    console.log();
    for (var i = 0; i < closingPriceTimeSeries.length; i++) {
      console.log('['+closingPriceTimeSeries[i] + ']' + ',');
    }
    //console.log();
    //console.log(closingPriceTimeSeries);
    //console.log(SMATimeSeries.length);

  });

  //return [SMATimeSeries, closingPriceTimeSeries];

}



//SMA();
SMA2();


module.exports = SMA;
