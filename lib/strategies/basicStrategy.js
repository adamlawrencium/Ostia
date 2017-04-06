var Poloniex = require('poloniex.js');
var Portfolio = require('../portfolio.js');
var async = require('async');
var math = require('mathjs');
var SMA = require('../indicators/sma.js');

poloniex = new Poloniex();
var Portfolio = new Portfolio();


var d = new Date();
var currentDate = Math.floor((d.getTime() / 1000));
var secsPerDay = 86400;
var numDays = 300 * secsPerDay;
var startDate = currentDate - numDays;
var period = 86400; // valid values: 300, 900, 1800, 7200, 14400, 86400
var currencyA = "USDT";
var currencyB = "BTC";
var endDate = 9999999999; // used as most recent time for Poloniex

function historicalTrader(candlestickData) {
  // loop through candlestickData and find historical trade opportunities
  // then return a list of those opportunities according to highchart's flag needs
}

function generateIndicators(candlestickData, callback) {
  console.log('### computing indicators...');
  var indicators = {};
  indicators.SMA10 = SMA(candlestickData, 15);
  indicators.SMA20 = SMA(candlestickData, 30);
  callback(indicators);
}

function determineStrategyState(timeIndex, smallerWindowSMA, largerWindowSMA) {
  /*
  When smallerWindowSMA is above largerWindowSMA, strategy state is in LONG_ZONE
  When smallerWindowSMA is below largerWindowSMA, strategy state is in SHORT_ZONE
  */
  if (smallerWindowSMA[timeIndex][1] < largerWindowSMA[timeIndex][1]) {
    return 'SHORT_ZONE';
  } else {
    return 'LONG_ZONE';
  }
}

function createTradeOrderObjFromState(newState, timestamp) {
  if (newState == 'LONG_ZONE') {
    return {
      longShort: 'BUY',
      timeStamp: timestamp
    };
  }
  else if (newState == 'SHORT_ZONE') {
    return {
      longShort: 'SELL',
      timeStamp: timestamp
    };
  }
  else { console.log('### ERROR: invalid state');}
}

function findTickByTimestamp(candlestickData, timestamp) {
  for (var i = 0; i < candlestickData.length; i++) {
    if (candlestickData[i].date == timestamp) {
      return i;
    }
  }
  console.log('ERROR: cannot find tick');
  return null;
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

      Portfolio.addNewPosition()
      callback(null, candlestickData);
    });
  },

  /* 2. Generate indicators */
  function (candlestickData, callback) {
    generateIndicators(candlestickData, function (indicators) {
      console.log('### indicators generated:', indicators.SMA10[0], '...');
      exports.candlestickData = candlestickData;
      exports.indicators = indicators;
    });
    callback(null);
  },

  // TODO: turn indicators into list of objects that contain metadata about
  // each indicator: name: SMA10, windowsize: 10, etc...

  /* 3. Execute trade logic */
  function (callback) {
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

    var seriesLength = smallerWindowSMA.length;     // trivial SMA choosen for length
    var flagsArray = [];
    var strategyState = null;
    var previousState = strategyState;
    for (var i = 0; i < seriesLength; i++) {
      currentState = determineStrategyState(i, smallerWindowSMA, largerWindowSMA);
      if (currentState != previousState) {
        // TODO: add new position from orderObj
        var timestamp = smallerWindowSMA[i][0];
        var orderObj = createTradeOrderObjFromState(currentState, timestamp);
        var timestampIndex = findTickByTimestamp(exports.candlestickData, timestamp);
        Portfolio.modifiyPosition(currencyA + currencyB, 100, exports.candlestickData[timestampIndex].date, timestamp);
        Portfolio.printAllPositions();
        flagsArray.push(orderObj);
      }
      previousState = currentState;
    }
    exports.flags = flagsArray;
    callback(null);
  },
  /* END TRADE LOGIC */

  /* 4. Pull live data from Poloniex package every second */
  function (callback) {
    setInterval(function () {
      poloniex.returnTicker(function (err, data) {
        // TODO: add error handling
        lastTickerData = data['USDT_BTC']['last'];
        exports.updatedFinanceData = lastTickerData;
      });
    }, 1000);
  }
]);
