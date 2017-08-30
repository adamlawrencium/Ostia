/* EXPONENTIAL MOVING AVERAGE INDICATOR AND ALGORITHM */

'use strict';

/* == EMA Function ==
 * param: candleStickData
 *    This object consists of date objects (candleStickData[i].date) and closing price objects (candleStickData[i].close).
 *     It is candlestick data for a cryptocurrency over some period with some frequency.
 * param: MAWindowSize
 *    This object is a number defining the amount of days to calculate the EMA over
 * return: MATimeSeries
 *    This object consists of date objects (MATimeSeries[i][0]) and closing price objects (MATimeSeries[i][1]). It represents
 *     the exponential moving average over MAWindowSize of candleStickData.
 *
 * effect: This function calculates the EMA for datapoints that are variable length apart, over MAWindowSize # of days.
 */

var EMA = function (candleStickData, MAWindowSize) {
  // Calcuating interval between the dates, and the amount of values needed each day
  var interval = candleStickData[1].date - candleStickData[0].date;
  var entryPerDay = 86400 / interval;
  var MATimeSeries = [];
  //var prev = null;
  var avg = 0;
  var multiplier = 2 / (MAWindowSize + 1);

  // Looping through each entry in the candleStickData object
  for (var i = 0; i < candleStickData.length; i++) {

    // Initial set-up of the first EMA (which happens to be a SMA calculation)
    if (i == MAWindowSize * entryPerDay - 1) {
      for (var j = 0; j < MAWindowSize * entryPerDay; j++) {
        avg += candleStickData[j].close;
      }
      avg = avg / (MAWindowSize * entryPerDay);
      MATimeSeries.push([candleStickData[i].date, avg]);
    }

    // Each time after the initial set-up, the formula for EMA is calculated
    //    http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:moving_averages
    //    Essentially the EMA = multiplier * (close - EMA_prev) + EMA_prev
    if (i > MAWindowSize * entryPerDay - 1) {
      var prev_EMA = MATimeSeries[i - (MAWindowSize * entryPerDay - 1) - 1][1];
      avg = multiplier * (candleStickData[i].close - prev_EMA) + prev_EMA;
      MATimeSeries.push([candleStickData[i].date, avg]);
    }
  }
  return MATimeSeries;
}
/*
// EMA TEST
var day = 86400;
var test = [{date:0, close:1},{date:day, close:1},{date:day*2, close:2},{date:day*3, close:3},{date:day*4, close:4},{date:day*5, close:5}];
var test2 = 3;
var test3 = [];
test3 = EMA(test, test2);
if (test3 =  [ [ day*2, 4/3 ], [ day*3, 13/6 ], [ day*4, 37/12 ], [ day*5, 97/24 ] ]){
  console.log("good");
}
else {
  console.log(":(");
}
*/

module.exports = EMA;
