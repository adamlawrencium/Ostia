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

poloniex.return24hVolume(function(err, data) {
  if (err){
    console.log('ERROR', err);
    return;
  }
  console.log(data);
});

poloniex.returnOrderBook("BTC", "ETC",function(err, data) {
  if (err){
    console.log('ERROR', err);
    return;
  }
  console.log(data);
});
