/*
This is a basic strategy file with three main components:
  1. The actual algorithm (largestSpreadArbitrage) that finds the largest spread
  2. Output function (outputPerformanceData) that returns logging infomation
  3. Order object (order) that returns infomation and or data
      this will be used to send to server for trade orders

This fill will output two things:
  1. An order
  2. Fincial information that can be sent to the client for performance tracking

TODO: Format of generic strategy file needs to be discussed

TODO: CONSIDER USING ONLY API CALLS INSTEAD OF WS.
*/

var order = function(data) {
  // ORDER STUB
}

var outputPerformanceData = function(exchangeData,performanceData) {
  // FUNCTION STUB
}

function meanReversion(pair, time) {
  // FUNCTION STUB
}

module.exports = {
  // EXPORT STUB
}
