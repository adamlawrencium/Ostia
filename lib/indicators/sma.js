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

var calcAvg = function(array) {

}

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

poloniex.returnChartData("USDT", "ETH", 86400, startDate, endDate, function(err, response) {
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
  console.log("1movingAverage: " + movingAverage);

  for (var i = 0; i < movingWindow.length; i++) {
    movingAverage += movingWindow[i][1];
  }
  console.log("2movingAverage: " + movingAverage);
  movingAverage = movingAverage / timeFrame;

  for (var i = timeFrame; i < timeData.length; i++) {

    SMATimeSeries.push(movingAverage);

    movingAverage *= timeFrame;
    movingAverage -= movingWindow.shift()[1];
    movingAverage += movingWindow.push(timeData[i][1]);
    movingAverage /= timeFrame;
    
  }

  console.log(SMATimeSeries);
  /*

  sma average = [];
  for i in range(len(array)):





  //console.log(timeData);
  var movingAverage = [];
  var sum = 0;
  for (var i = 0; i < timeData.length; i++) {   // add elements to SMA
    console.log('#####i: ' + i);
    sum = 0;
    var j = 0;
    for (j = i; j < (i+timeFrame)-1; j++) {
      sum += timeData[j][1];
      console.log('j: '+j);
      //console.log(timeData[j]);
    }

    //console.log(timeData[j]);
    //SMATimeSeries.push([ timeData[j-1][0] , sum/timeFrame ]);
  }

  //console.log(SMATimeSeries);*/
});







/*
// Can implement timeSeriesData as a Queue
var simpleMovingAverage = function (timeSeriesData, newDataPoint, timePeriod) {

  timeSeriesData.push(newDataPoint);
  timeSeriesData.pop();
  var MA = 0;
  for (point in timeSeriesData) {
    if (point.data < timePeriod) {
        MA += point.value;
    }
  }

  MA = MA / timePeriod;
  return MA;
}

module.exports = function(indicatorMixin, accessor_ohlc) {  // Injected dependencies
  return function() { // Closure function
    var p = {},  // Container for private, direct access mixed in variables
        samples,
        currentIndex,
        total;

    function indicator(data) {
      indicator.init();
      return data.map(ma).filter(function(d) { return d.value !== null; });
    }

    indicator.init = function() {
      total = 0;
      samples = [];
      currentIndex = 0;
      return indicator;
    };

    function ma(d, i) {
      var value = indicator.average(p.accessor(d));
      if (i+1 < p.period) value = null;
      return { date: p.accessor.d(d), value: value };
    }

    indicator.average = function(value) {
      total += value;

      if(samples.length+1 < p.period) {
        samples.push(value);
        return total/++currentIndex;
      }
      else {
        if(samples.length < p.period) {
          samples.push(value);
          total += value;
        }

        total -= samples[currentIndex];
        samples[currentIndex] = value;
        if(++currentIndex === p.period) {
          currentIndex = 0;
        }

        return total/p.period;
      }
    };

    // Mixin 'superclass' methods and variables
    indicatorMixin(indicator, p)
      .accessor(accessor_ohlc())
      .period(10);

    return indicator;
  };
};
*/
