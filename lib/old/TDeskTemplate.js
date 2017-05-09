/*
Main keeps the logic loop going for the strategy. It facilitates trading.

Basic proces:
Set up all exchanges
Set up utilities


if backtest == true:
backtest();
else:
runTrading();


*/

// Template config file
var config = {
  liveTrading:  true,
  backtestMode: false,
  strategyName: "EMA",       // exponential moving average
  exchanges:    ["GDAX"],    // exchanges strategy will trade
  pair:         "BTC_ETC",   // or "none" for every pair
  capital:      3000,        // starting capital
  time_frame:   4,           // how long to trade
  blah:         "other param",
  API_KEYS:     ["123XYZ"]
}


// var exchange = config.exchanges[0];
// var path = "./js/data-parsing/" + exchange + ".js";
// var exchange = require(path)(allExchangeData.exchange)


//     vv  END INTERFACE GOAL vv

var getExchanges = function () {
  var ex = config.exchanges;
  switch (ex) {
    case "GDAX":      return require("./lib/exchanges/GDAX.js");
    case "Poloniex":  return require("./lib/exchanges/Poloniex.js");
    case "Kraken":    return require("./lib/exchanges/Kraken.js");
    default:          throw new Error("unknown configuration env variable EXCHANGE " + ex);
  }
}

var exchanges   = getExchanges();

var TradingHub  = new TradingHub(config.exchanges[0]);
var DataHub     = TradingHub.createOrderbooks();
var orderbook   = DataHub.getOrderbooks();



function runLiveTrading(config) {
  if (config.liveTrading == true) {
    while (elapased_time < time_frame || interface.stop == true) {
      var order = config.strategyFunc(config.strategyName, orderbooks);
      if (order.buy == true || order.sell == true) {
        TradingHub.trade(order);
      }
    }
  }
}

module.exports = runLiveTrading;

// TODO: Also export data to server with SocketIO for client-side visualizations
exit(1);
