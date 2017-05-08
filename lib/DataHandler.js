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

// TODO: use Indicator handler in the future
var sma = require('./indicators/sma.js');
var Poloniex = require('poloniex.js');
var polo = new Poloniex();


class DataHandler {

  // DataHandler takes in a strategy request and pulls all pertinent data.
  // All out-data is stored in 'miniDB'
  constructor(strategyRequest) {
    this.request = strategyRequest;
    this.reqIndicators = strategyRequest.indicators;
    this.miniDB = {};
  }


  // only creates object with relevant data.
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
      var tickerData = [];
      polo.returnChartData(r.A, r.B, r.period, r.start, r.end, (err, data) => {
        if (err) { throw new Error('data request messed up...') }
        else {
          for (var i = 0; i < data.length; i++) {
            tickerData.push(data[i]);
          }
          this.miniDB.tickerData = tickerData;
          resolve(this.miniDB.tickerData);
        }
        reject('Something happened, oh no!');
      });
    });
  }


  generateIndicatorTimeSeries(tickerData) {
    this.miniDB.generatedIndicators = [];
    for (var i = 0; i < this.reqIndicators.length; i++) {

      if (this.reqIndicators[i].indicator == 'SMA') {
        var indicator = sma(tickerData, this.reqIndicators[i].parameter);
        this.miniDB.generatedIndicators.push(indicator);
      }

      else if (this.reqIndicators[i].indicator == 'EMA') {
        // TODO EMA
      }

      else if (this.reqIndicators[i].indicator == 'RSI') {
        // TODO RSI
      }
    }
    return this.miniDB.generatedIndicators;
  }


  getFinancialData() {
    return new Promise( (resolve, reject) => {
      this.initializeDataFromExchange()
      .then( data => {
        this.generateIndicatorTimeSeries(data);
        resolve(this.miniDB);
      })
      .catch( err => {
        reject(err);
      });
    });
  }

} // End DataHandler

module.exports = DataHandler;
