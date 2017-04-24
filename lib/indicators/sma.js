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
    console.log('inside');
    var candleStickData = [];
    for (var i = 0; i < response.length; i++) {
      candleStickData.push(response[i]);
    }
    return candleStickData;
  });
}

var SMA_bare = function(candleStickData, MAWindowSize) {
  var MATimeSeries = [];
  var closingPriceTimeSeries = [];
  for (var i = 0; i < candleStickData.length; i++) {
    closingPriceTimeSeries.push([candleStickData[i].date, candleStickData[i].close]);
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

  // setTimeout(function() {
  //     //console.log('MATimeSeries', MATimeSeries);
  //     return MATimeSeries;
  // }, 3000);
  return MATimeSeries;
}

/* == SMA_var Function ==
 * param: candleStickData
 *    This object consists of date objects (candleStickData[i].date) and closing price objects (candleStickData[i].close).
 *     It is candlestick data for a cryptocurrency over some period with some frequency.
 * param: MAWindowSize
 *    This object is a number defining the amount of days to calculate the SMA over
 * return: MATimeSeries
 *    This object consists of date objects (MATimeSeries[i][0]) and closing price objects (MATimeSeries[i][1]). It represents
 *     the moving average over MAWindowSize of candleStickData.
 *
 * effect: This function calculates the SMA for datapoints that are variable length apart, over MAWindowSize # of days.
 */

var SMA_var = function(candleStickData, MAWindowSize) {
  // Calcuating interval between the dates, and the amount of values needed each day
  var interval = candleStickData[1].date - candleStickData[0].date;
  var entryPerDay = 86400/interval;
  var MATimeSeries = [];
  var prev = null;
  var avg = 0;

  // Looping through each entry in the candleStickData object
  for (var i = 0; i < candleStickData.length; i++){

    // Initial set-up of the first SMA average that can be calculated
    if (i == MAWindowSize * entryPerDay - 1){
      for (var j = 0; j < MAWindowSize * entryPerDay; j++){
        avg += candleStickData[j].close;
      }
      avg = avg/(MAWindowSize * entryPerDay);
      MATimeSeries.push([candleStickData[i].date, avg]);
      prev = candleStickData[0].close;
    }

    // Each time after the initial set-up, the avg is subtracted by the prev, and is added to the newest value
    if (i > MAWindowSize * entryPerDay - 1){
      avg = avg - prev/(MAWindowSize * entryPerDay) + candleStickData[i].close/(MAWindowSize * entryPerDay);
      MATimeSeries.push([candleStickData[i].date, avg]);
      prev = candleStickData[i - (MAWindowSize * entryPerDay - 1)].close;
    }
  }
  return MATimeSeries;
}

/* NEW SMA TEST
var test = [{date:0, close:1},{date:43200, close:4},{date:86400, close:3},{date:12960, close:6},{date:192800, close:5},{date:192800+43200, close:7}];
var test2 = 2;
var test3 = [];
test3 = SMA_var(test, test2);
if (test3 =  [ [ 12960, 3.5 ], [ 192800, 4.5 ], [ 236000, 5.25 ] ]){
  console.log("good");
}
*/

module.exports = SMA_var;
