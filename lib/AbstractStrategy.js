/*
Strategy takes in N things:
- Time series data
- Indicator timeseries

TODO: Strategy only executes upon strategy logic
*/

"use strict";

var Portfolio = require('./portfolio.js');

class AbstractStrategy {
  constructor(strategyConfig, dataPackage) {
    this.tickerData = dataPackage.tickerData; // list of objects
    this.indicators = dataPackage.generatedIndicators; // [ a[ [0,2.3],[1,3.4] ], b[ [0,2.3],[1,3.4] ] ]

    this.SMA_A = dataPackage.generatedIndicators[0];
    this.SMA_B = dataPackage.generatedIndicators[1]

    this.orders;
    this.backtest;
    this.benchmark;
  }

  prepareData() {
    var smallerWindowSMA; var largerWindowSMA;
    if (this.SMA_A.length < this.SMA_B.length) {
      var smallerWindowSMA = this.SMA_A;
      var largerWindowSMA = this.SMA_B;
    } else {
      var smallerWindowSMA = this.SMA_B;
      var largerWindowSMA = this.SMA_A;
    }
    // Trim beginning of the longer series (smallerWindowSMA)
    for (var i = 0; i < smallerWindowSMA.length; i++) {
      if (smallerWindowSMA[i][0] == largerWindowSMA[0][0]) {
        smallerWindowSMA = smallerWindowSMA.slice(i, smallerWindowSMA.length);
      }
    }
    if (smallerWindowSMA.length != largerWindowSMA.length) {
      console.log('### INDICATOR SERIES NOT SAME LENGTH!');
    }
    return [smallerWindowSMA, largerWindowSMA];
  }

  determineStrategyState(timeIndex, smallerWindowSMA, largerWindowSMA) {
    /*
    When smallerWindowSMA is above largerWindowSMA, strategy state is in LONG_ZONE
    When smallerWindowSMA is below largerWindowSMA, strategy state is in SHORT_ZONE
    */
    if (smallerWindowSMA[timeIndex][1] < largerWindowSMA[timeIndex][1]) {
      return 'SHORT_ZONE';
    }
    else {
      return 'LONG_ZONE';
    }
  }

  createTradeOrderObjFromState(currencyPair, newState, timestamp) {
    var closingPrice = getClosingPriceFromTimestamp(exports.candlestickData, timestamp);
    if (newState == 'LONG_ZONE') {
      return {
        currencyPair: currencyPair,
        longShort: 'BUY',
        timestamp: timestamp,
        price: closingPrice,
        quantity: 2
      };
    }
    else if (newState == 'SHORT_ZONE') {
      return {
        currencyPair: currencyPair,
        longShort: 'SELL',
        timestamp: timestamp,
        price: closingPrice,
        quantity: -2
      };
    }
    else {
      console.log('### ERROR: invalid state', console.log(new Error().stack));
    }
  }

  driver() {
    var Portfolio = new Portfolio();

    var ret = this.prepareData();
    var smallerWindowSMA = ret[0];
    var largerWindowSMA = ret[1];

    var seriesLength = smallerWindowSMA.length; // trivial SMA choosen for length
    var flags = [];
    var strategyState = null;
    var previousState = strategyState;
    var marketData = exports.candlestickData;
    for (var i = 0; i < seriesLength; i++) {
      currentState = determineStrategyState(i, smallerWindowSMA, largerWindowSMA);
      if (currentState != previousState) {

        var tradeTimestamp = smallerWindowSMA[i][0]; // timestamp of trade

        var order = createTradeOrderObjFromState(A_B, currentState, tradeTimestamp);
        Portfolio.modifiyPosition(order, marketData);
        Portfolio.printPortfolio();
        flags.push(order);
      }
      previousState = currentState;
    }

    var backtest = Portfolio.calculateHistoricalPerformance(marketData, currencyA, currencyB, 'blah');
    var benchmark = Portfolio.calculateHistoricalBenchmark(marketData, currencyA);

    exports.backtest = backtest;
    exports.benchmark = benchmark;
    this.orders = flags;
  }



  getTradeOrders() {

    return 'orders'
  }

}


module.exports = AbstractStrategy;
