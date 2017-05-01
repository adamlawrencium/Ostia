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
var math = require('mathjs');
poloniex = new Poloniex();

var d = new Date();
var currentDate = Math.floor((d.getTime() / 1000));
var secsPerDay = 86400;
var numDays = 300 * secsPerDay;
var startDate = currentDate - numDays;
var period = 14400; // valid values: 300, 900, 1800, 7200, 14400, 86400
var currencyA = "USDT";
var currencyB = "BTC";
var A_B = currencyA + currencyB;
var endDate = 9999999999; // used as most recent time for Poloniex

// poloniex.returnChartData(currencyA, currencyB, period, startDate, endDate, function (err, response) {

class DataHandler {

  // DataHandler takes in a strategy request and pulls all pertinent data.
  constructor(strategyRequest) {
    this.request = strategyRequest;
    this.reqCurrencyPair = strategyRequest.currencyPair;
    this.reqIndicators = strategyRequest.indicators;

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
