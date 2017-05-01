/*
DataHandler takes in config which contains:
var config = {
  strategyName: 'My SMA strategy',
  currencyPair: 'BTCUSD',
  indicators: [ {
    indicator: 'SMA',
    parameters: 10
  }, {
    indicator: 'EMA',
    parameters: 15
  }],
  backtest: {
    backtestRequested: true,
    startingCapital: 1000
  }
}
*/

class DataHandler {

  // DataHandler takes in a strategy request and pulls all pertinent data.
  constructor(strategyRequest) {
    this.strategyRequest = strategyRequest;
  }
}

module.exports = DataHandler;
