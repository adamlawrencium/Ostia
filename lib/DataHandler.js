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
var Poloniex = require('poloniex.js');
var poloniex = new Poloniex();


// poloniex.returnChartData(currencyA, currencyB, period, startDate, endDate, function (err, response) {

class DataHandler {

  // DataHandler takes in a strategy request and pulls all pertinent data.
  constructor(strategyRequest) {
    this.request = strategyRequest;
    this.reqCurrencyPair = strategyRequest.currencyPair;
    this.reqIndicators = strategyRequest.indicators;

  }

  createPoloniexCandlestickRequest() {
    var r = this.request;
    return {
      currencyA: r.currencyA,
      currencyB: r.currencyB,
      period: r.reqData.period,
      start: r.reqData.startDate,
      end: r.reqData.endDate      
    }
  }

  getFinancialData() {
    return new Promise(function(resolve, reject) {

      if (1 == 1) {
        resolve('hello there, promise has been resolved:)')
      }
      else {
        reject('the world doesnt make sense');
      }
    });
  }

  getblah() {
    return this.strategyRequest;
  }

} // End DataHandler

module.exports = DataHandler;
