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

var returnSMA = function() {
// API Wrapper class
var Poloniex = require('poloniex.js');
var poloniex = new Poloniex();

// Create time frame for API call below
var d                 = new Date();
var endDate           = Math.floor(d.getTime() / 1000);
var timeFrame         = 30;             // 30 days
var secsPerDay        = 86400;
// need 2 multiplier to calculate SMA for first point
var startDate         = endDate - (timeFrame * secsPerDay * 2);

// Call historical data and add (date,closingPrice) pairs to timeData;
var timeData      = [];
var SMATimeSeries = [];

poloniex.returnChartData("USDT", "BTC", 86400, startDate, endDate, function(err, response) {
  if (err) {
    console.log("error!");
  }
  console.log(response);
  for (var i = 0; i < response.length; i++) {
    timeData.push([response[i].date, response[i].close]);
  }

  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

  var movingWindow = [];
  for (var i = 0; i < timeFrame; i++) {
    movingWindow.push(timeData[i]);
  }
  var movingAverage = 0;
  for (var i = 0; i < movingWindow.length; i++) {
    movingAverage += movingWindow[i][1];
  }
  movingAverage = movingAverage / timeFrame;
  SMATimeSeries.push([timeData[timeFrame][0],movingAverage]);
  for (var i = timeFrame+1; i < timeData.length; i++) {
    movingAverage *= timeFrame;
    movingAverage -= movingWindow.shift()[1];
    movingWindow.push(timeData[i][1]);
    movingAverage += timeData[i][1];
    movingAverage /= timeFrame;
    SMATimeSeries.push([timeData[i][0],movingAverage]);
  }

  console.log(SMATimeSeries);
  console.log(SMATimeSeries.length);


});

return SMATimeSeries;

}


module.exports = returnChartData;
