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
var polo = new Poloniex();


// poloniex.returnChartData(currencyA, currencyB, period, startDate, endDate, function (err, response) {

class DataHandler {

  // DataHandler takes in a strategy request and pulls all pertinent data.
  constructor(strategyRequest) {
    this.request = strategyRequest;
    this.reqCurrencyPair = strategyRequest.currencyPair;
    this.reqIndicators = strategyRequest.indicators;
  }

  // only creates object with relavant data.
  createPoloniexCandlestickRequest() {
    var r = this.request;
    var ret = {
      A: r.currencyA,
      B: r.currencyB,
      period: r.reqData.period,
      start: r.reqData.startDate,
      end: r.reqData.endDate
    }
    return ret;
  }

  initializeDataFromExchange() {
    return new Promise( (resolve, reject) => {
      var r = this.createPoloniexCandlestickRequest();
      var candlestickData = [];
      polo.returnChartData(r.A, r.B, r.period, r.start, r.end, (err, data) => {
        if (err) {
          throw new Error('data request messed up...');
        } else {
          for (var i = 0; i < data.length; i++) {
            candlestickData.push(data[i]);
          }
          this.tickerData = candlestickData;
          resolve(this.tickerData);
        }
        reject('Something happened, oh no!');
      });
    });
  }

  getFinancialData() {
    return new Promise( (resolve, reject) => {
      resolve()
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
