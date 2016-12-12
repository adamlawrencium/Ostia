var Poloniex = require('./poloniexAPI.js');

// Create a new instance
poloniex = new Poloniex();

// TESTS
poloniex.getTicker(function(err, data) {
  if (err){
    console.log('ERROR', err);
    return;
  }
  console.log(data);
});

poloniex.get24hVolume(function(err, data) {
  if (err){
    console.log('ERROR', err);
    return;
  }
  console.log(data);
});

poloniex.getOrderBook("BTC", "ETC",function(err, data) {
  if (err){
    console.log('ERROR', err);
    return;
  }
  console.log(data);
});

var d                 = new Date();
var endDate           = Math.floor(d.getTime() / 1000);
var secsPerDay        = 86400;
var startDate         = endDate - secsPerDay * 10;
poloniex.getChartData("USDT", "BTC", 86400, startDate, endDate, function(err, response) {
  if (err) {
    console.log("error!");
  }
  console.log(response);
});

poloniex.returnCurrencies(function(err,data) {
  if (err) {
    console.log("error!");
  }
  console.log(data);


});
