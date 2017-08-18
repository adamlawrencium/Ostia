/* SIMPLE MOVING AVERAGE INDICATOR AND ALGORITHM */

'use strict';

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

var SMA = function (candleStickData, MAWindowSize) {
  // return new Promise(function(resolve, reject) {

    // Calcuating interval between the dates, and the amount of values needed each day
    var interval = candleStickData[1].date - candleStickData[0].date;
    var entryPerDay = 86400 / interval;
    var MATimeSeries = [];
    var prev = null;
    var avg = 0;

    // Looping through each entry in the candleStickData object
    for (var i = 0; i < candleStickData.length; i++) {

      // Initial set-up of the first SMA average that can be calculated
      if (i == MAWindowSize * entryPerDay - 1) {
        for (var j = 0; j < MAWindowSize * entryPerDay; j++) {
          avg += candleStickData[j].close;
        }
        avg = avg / (MAWindowSize * entryPerDay);
        MATimeSeries.push([candleStickData[i].date, avg]);
        prev = candleStickData[0].close;
      }

      // Each time after the initial set-up, the avg is subtracted by the prev, and is added to the newest value
      if (i > MAWindowSize * entryPerDay - 1) {
        avg = avg - prev / (MAWindowSize * entryPerDay) + candleStickData[i].close / (MAWindowSize * entryPerDay);
        MATimeSeries.push([candleStickData[i].date, avg]);
        prev = candleStickData[i - (MAWindowSize * entryPerDay - 1)].close;
      }
    }

    // return resolve(MATimeSeries);

    return MATimeSeries;
  // });
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

module.exports = SMA;
