var Poloniex = require('poloniex.js');
var Portfolio = require('../portfolio.js');
var async = require('async');
var math = require('mathjs');
var SMA = require('../indicators/sma.js');
var indicatorHandler = require('../indicators/indicatorHandler.js');

poloniex = new Poloniex();
var Portfolio = new Portfolio();


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

function historicalTrader(candlestickData) {
  // loop through candlestickData and find historical trade opportunities
  // then return a list of those opportunities according to highchart's flag needs
}

function generateIndicators(candlestickData, callback) {
  console.log('### computing indicators...');
  var indicators = {};
  indicators.SMA10 = SMA(candlestickData, 5);
  indicators.SMA20 = SMA(candlestickData, 20);
  callback(indicators);
}

function determineStrategyState(timeIndex, smallerWindowSMA, largerWindowSMA) {
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

function createTradeOrderObjFromState(currencyPair, newState, timestamp) {
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

function getClosingPriceFromTimestamp(candlestickData, timestamp) {
  var timestampIndex = findTickByTimestamp(exports.candlestickData, timestamp);
  if (timestampIndex != null) {
    var closingPrice = exports.candlestickData[timestampIndex].close;
    return closingPrice;
  }
  else {
    throw 'ERROR: timestamp is null.', console.log(new Error().stack);;
  }
}

function findTickByTimestamp(candlestickData, timestamp) {
  if (timestamp != null) {
    for (var i = 0; i < candlestickData.length; i++) {
      if (candlestickData[i].date == timestamp) {
        return i;
      }
    }
    throw 'ERROR: cannot find tick', console.log(new Error().stack);;
  }
  else {
    throw 'ERROR: timestamp is null.', console.log(new Error().stack);
  }
}

/** Strategy Steps:
1. Initialze data | Pull candlestick data from Poloniex exchange
2. Generate indicators | from pulled candlestick data
3. Execute trade logic | Run through indicators and generate trade actions
4. Poll live data | from exchange and send it to UI
*/
async.waterfall([

  /* 1. Initialze data */
  function (callback) {
    console.log('### requesting exchange data...');
    poloniex.returnChartData(currencyA, currencyB, period, startDate, endDate, function (err, response) {
      console.log('### exchange data (candlestick) received.');
      var candlestickData = [];
      if (err) {
        console.log("error!");
      }
      for (var i = 0; i < response.length; i++) {
        candlestickData.push(response[i]);
      }
      exports.candlestickData = candlestickData;

      callback(null, candlestickData);
    });
  },

  /* 2. Generate indicators */
  function (candlestickData, callback) {
    var indicators = {};
    exports.indicators = indicators;

    // var SMA10 = indicatorHandler(candlestickData, {indicator: 'SMA', param: 10});
    // //var SMA20 = indicatorHandler(candlestickData, {indicator: 'SMA', param: 15});
    //
    // exports.indicators.SMA10 = 'blah';
    // console.log('### indicators generated:', SMA[0], '...');
    //
    //
    // callback(null);

    indicatorHandler(candlestickData, {indicator: 'SMA', param: 10})
    .then(function(timeseriesData){
      exports.indicators.SMA10 = timeseriesData
      return callback(null)
    })
  },

  // TODO: turn indicators into list of objects that contain metadata about
  // each indicator: name: SMA10, windowsize: 10, etc...

  /* 3. Execute trade logic */
  function (callback) {
    console.log(exports);



    var smallerWindowSMA = exports.indicators.SMA10; // smaller window contains more data points
    var largerWindowSMA = exports.indicators.SMA20; // larger window contains less data points

    // Trim beginning of the longer series (smallerWindowSMA)
    for (var i = 0; i < smallerWindowSMA.length; i++) {
      if (smallerWindowSMA[i][0] == largerWindowSMA[0][0]) {
        smallerWindowSMA = smallerWindowSMA.slice(i, smallerWindowSMA.length);
      }
    }
    if (smallerWindowSMA.length != largerWindowSMA.length) {
      console.log('### INDICATOR SERIES NOT SAME LENGTH!');
    }
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

        // We do this process because the SMA data doesn't contain the closing price
        // and we need to get it from candlestickData instead.

        var order = createTradeOrderObjFromState(A_B, currentState, tradeTimestamp);
        Portfolio.modifiyPosition(order, marketData);
        //Portfolio.printPortfolio();
        flags.push(order);
      }
      previousState = currentState;
    }

    var backtest = Portfolio.calculateHistoricalPerformance(marketData, currencyA, currencyB, 'blah');
    var benchmark = Portfolio.calculateHistoricalBenchmark(marketData, currencyA);

    exports.backtest = backtest;
    exports.benchmark = benchmark;
    exports.flags = flags;

    callback(null);
  },
  /* END TRADE LOGIC */

  /* 4. Pull live data from Poloniex package every second */
  function (callback) {
    setInterval(function () {
      poloniex.returnTicker(function (err, data) {
        if (err != null) {
          console.log(err);
          console.log('LIVE ERROR, RETRYING...');
        }
        else {
          lastTickerData = data['USDT_BTC']['last'];
          exports.updatedFinanceData = lastTickerData;
        }
      });
    }, 1000);
  }
]);
