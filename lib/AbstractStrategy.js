/*
Strategy takes in N things:
- Time series data
- Indicator timeseries

TODO: Strategy only executes upon strategy logic
*/

"use strict";

var Portfolio = require('./portfolio.js');


class AbstractStrategy {
  /**
   * Constructor assigns params to object and also adds specific SMAs
   * @param  {object} strategyConfig user's strategy request
   * @param  {object} dataPackage    contains all pertinent data
   */
  constructor(strategyConfig, dataPackage) {
    this.strategyConfig = strategyConfig;
    this.tickerData = dataPackage.tickerData; // list of objects
    this.indicators = dataPackage.generatedIndicators; // [ a[ [0,2.3],[1,3.4] ], b[ [0,2.3],[1,3.4] ] ]

    this.SMA_A = dataPackage.generatedIndicators[0];
    this.SMA_B = dataPackage.generatedIndicators[1]

    this.orders;
    this.backtest;
    this.benchmark;
  }

  /**
   * Takes indicator datasets and trims them to the same length.
   * Also assigns which one has a larger window. This is directly tied to trading
   * logic. TODO separate logic. maybe create an indicator class for this.
   * @return {array} two arrays with timeseries data.
   */
  prepareData() {
    var smallerWindowSMA;
    var largerWindowSMA;
    if (this.SMA_A.length > this.SMA_B.length) {
      var smallerWindowSMA = this.SMA_A;
      var largerWindowSMA = this.SMA_B;
    }
    else {
      var smallerWindowSMA = this.SMA_B;
      var largerWindowSMA = this.SMA_A;
    }

    for (var i = 0; i < smallerWindowSMA.length; i++) {
      if (smallerWindowSMA[i][0] == largerWindowSMA[0][0]) {
        smallerWindowSMA = smallerWindowSMA.slice(i, smallerWindowSMA.length);
      }
    }
    if (smallerWindowSMA.length != largerWindowSMA.length) {
      throw new Error('Indicator series are not the same length');
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


  findTickByTimestamp(tickerData, timestamp) {
    if (timestamp != null) {
      for (var i = 0; i < tickerData.length; i++) {
        if (tickerData[i].date == timestamp) {
          return i;
        }
      }
      throw 'ERROR: cannot find tick', console.log(new Error().stack);;
    }
    else {
      throw 'ERROR: timestamp is null.', console.log(new Error().stack);
    }
  }

  getClosingPriceFromTimestamp(tickerData, timestamp) {
    var timestampIndex = this.findTickByTimestamp(this.tickerData, timestamp);
    if (timestampIndex != null) {
      var closingPrice = this.tickerData[timestampIndex].close;
      return closingPrice;
    }
    else {
      throw 'ERROR: timestamp is null.', console.log(new Error().stack);;
    }
  }


  createTradeOrderObjFromState(newState, timestamp) {
    var currencyPair = this.strategyConfig.currencyA + this.strategyConfig.currencyB;
    var closingPrice = this.getClosingPriceFromTimestamp(this.tickerData, timestamp);
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
    var portfolio = new Portfolio();

    var ret = this.prepareData();
    var smallerWindowSMA = ret[0];
    var largerWindowSMA = ret[1];

    var seriesLength = smallerWindowSMA.length; // trivial SMA choosen for length
    var flags = [];
    var strategyState = null;
    var previousState = strategyState;
    var marketData = this.tickerData;
    for (var i = 0; i < seriesLength; i++) {
      var currentState = this.determineStrategyState(i, smallerWindowSMA, largerWindowSMA);
      if (currentState != previousState) {

        var tradeTimestamp = smallerWindowSMA[i][0]; // timestamp of trade

        var order = this.createTradeOrderObjFromState(currentState, tradeTimestamp);
        portfolio.modifiyPosition(order, marketData);
        // portfolio.printPortfolio();
        flags.push(order);
      }
      previousState = currentState;
    }
    // console.log(flags);
    var backtest = portfolio.calculateHistoricalPerformance(marketData,
      this.strategyConfig.currencyA,
      this.strategyConfig.currencyB,
      'blah');

    var benchmark = portfolio.calculateHistoricalBenchmark(marketData, this.strategyConfig.currencyA);

    this.backtest = backtest;
    this.benchmark = benchmark;
    this.orders = flags;
  }


  getTradeOrders() {
    this.driver();
    return {
      tickerData: this.tickerData,
      backtest: this.backtest,
      benchmark: this.benchmark,
      orders: this.orders,
      indicators: this.indicators
    }
  }

}


module.exports = AbstractStrategy;
