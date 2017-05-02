/*
Strategy takes in N things:
- Time series data
- Indicator timeseries

TODO: Strategy only executes upon strategy logic
*/


class AbstractStrategy {
  constructor(strategyConfig, dataPackage) {
    this.tickerData = dataPackage.tickerData;
    this.indicators = dataPackage.generatedIndicators;
    this.SMA_A = dataPackage.generatedIndicators[0];
    this.SMA_B = dataPackage.generatedIndicators[1]
  }

  prepareData() {
    // Trim beginning of the longer series (smallerWindowSMA)
    for (var i = 0; i < smallerWindowSMA.length; i++) {
      if (smallerWindowSMA[i][0] == largerWindowSMA[0][0]) {
        smallerWindowSMA = smallerWindowSMA.slice(i, smallerWindowSMA.length);
      }
    }
    if (smallerWindowSMA.length != largerWindowSMA.length) {
      console.log('### INDICATOR SERIES NOT SAME LENGTH!');
    }
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
    var smallerWindowSMA = exports.indicators.SMA10; // smaller window contains more data points
    var largerWindowSMA = exports.indicators.SMA20; // larger window contains less data points


    console.log();
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
    exports.flags = flags;
  }



  getTradeOrders() {

    return 'orders'
  }

}


exports.module = AbstractStrategy;
