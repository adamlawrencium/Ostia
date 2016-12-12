var Poloniex = require('./poloniexAPI.js');

// Create a new instance
poloniex = new Poloniex();

// TESTS
// TODO: IMPLEMENT THESE TESTS USING MOCHA
poloniex.getTicker(function(err, data) {
  console.log(data);
});

poloniex.get24hVolume(function(err, data) {
  console.log(data);
});

poloniex.getOrderBook("BTC", "ETC",function(err, data) {
  console.log(data);
});

var d           = new Date();
var endDate     = Math.floor(d.getTime() / 1000);
var secsPerDay  = 86400;
var startDate   = endDate - secsPerDay * 10;
poloniex.getChartData("USDT", "BTC", 86400, startDate, endDate, function(err, response) {
  console.log(response);
});

poloniex.getCurrencies(function(err,data) {
  console.log(data);
});
