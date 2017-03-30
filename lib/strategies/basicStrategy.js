var Poloniex = require('poloniex.js');
var async = require('async');
var SMA = require('../indicators/sma.js');
var currencyPair = 'USDT_BTC';

// initialize poloniex wrapper
poloniex = new Poloniex();

/* THIS FUNCTION INITIALIZES THE TIME SERIES */
var math = require('mathjs');
var d = new Date();
var currentDate = Math.floor((d.getTime() / 1000));
var secsPerDay = 86400;
var numDays = 300 * secsPerDay;
var startDate = currentDate - numDays;
var period = 86400; // valid values: 300, 900, 1800, 7200, 14400, 86400
var currencyA = "USDT";
var currencyB = "BTC";
var endDate = 9999999999; // used as most recent time for Poloniex


// TODO: Clean up all these paramaeters and add error handling

/* Basic strategy
 * 1. Get the data
 * 2. Process data / calculate indicators
 * 3. Create an order
 */

/* Three waterfall functions:
 * 1. Request data from exchange (or DataHub in the future)
 * 2. Calcuate indicators
 * 3. Export data
 */
function historicalTrader(candlestickData) {
  // loop through candlestickData and find historical trade opportunities
  // then return a list of those opportunities according to highchart's flag needs
}


function generateIndicators(candlestickData, cb) {
  console.log('### computing indicators...');
  var indicators = {};
  indicators.SMA10 = SMA(candlestickData, 15);
  indicators.SMA20 = SMA(candlestickData, 30);
  cb(indicators);
}

function determineStrategyState(timeIndex, smallerWindowSMA, largerWindowSMA) {
  if (smallerWindowSMA[timeIndex][1] < largerWindowSMA[timeIndex][1]) {
    return 'SHORT_ZONE';
  } else {
    return 'LONG_ZONE';
  }
}

function createTradeOrderObj(action, timestamp) {
  var orderObj = {
    longShort: action,
    timeStamp: timestamp
  };
  return orderObj;
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



async.waterfall([

  /* Initialze data */
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
      callback(null, candlestickData);
    });
  },

  function (candlestickData, callback) {
    generateIndicators(candlestickData, function (indicators) {
      console.log('### indicators generated:', indicators.SMA10[0], '...');
      exports.candlestickData = candlestickData;
      exports.indicators = indicators;
    });
    callback(null);
  },

  // TRADE LOGIC HERE. This function find past trade opportunities.
  // TODO: turn indicators into list of objects that contain metadata about
  // each indicator: name: SMA10, windowsize: 10, etc...

  function (callback) {
    var smallerWindowSMA = exports.indicators.SMA10; // smaller window contains more data points
    var largerWindowSMA = exports.indicators.SMA20; // larger window contains less data points

    // trim beginning of the longer series (smallerWindowSMA)
    for (var i = 0; i < smallerWindowSMA.length; i++) {
      if (smallerWindowSMA[i][0] == largerWindowSMA[0][0]) {
        smallerWindowSMA = smallerWindowSMA.slice(i, smallerWindowSMA.length);
      }
    }
    if (smallerWindowSMA.length != largerWindowSMA.length) {
      console.log('### INDICATOR SERIES NOT SAME LENGTH!');
    } else {
      console.log('### INDICATOR SERIES SAME LENGTH!');
    }
    var seriesLength = smallerWindowSMA.length;     // trivial SMA choosen for length

    // Determine current state of both indicators -- which is above the other
    var upperIndicator = null;
    var lowerIndicator = null;
    var flagsArray = [];

    // lowerIndicator = smallerWindowSMA;
    // upperIndicator = largerWindowSMA;

    var strategyState = null;
    // When smallerWindowSMA is above largerWindowSMA, strategy state is in LONG_ZONE
    // When smallerWindowSMA is below largerWindowSMA, strategy state is in SHORT_ZONE
    // This gives the starting position of each indicator
    if (smallerWindowSMA[0][1] < largerWindowSMA[0][1]) {
      strategyState = 'SHORT_ZONE';
      lowerIndicator = smallerWindowSMA;
      upperIndicator = largerWindowSMA;
      console.log('smallerWindowSMA is lower');
    } else {
      strategyState = 'LONG_ZONE';
      lowerIndicator = largerWindowSMA;
      upperIndicator = smallerWindowSMA;
      console.log('largerWindowSMA is lower');
    }

    if (strategyState == null) {
      console.log('### ERROR: strategyState is null. HOLD UP.');
    }

    var previousState = strategyState;
    for (var i = 0; i < seriesLength; i++) {
      currentState = determineStrategyState(i, smallerWindowSMA, largerWindowSMA);
      if (currentState != previousState) {
        var timestamp = smallerWindowSMA[i][0];
        var orderObj = createTradeOrderObjFromState(currentState, timestamp);
        flagsArray.push(orderObj);
      }
      previousState = currentState;
    }

    // Keep track of indicators until one becomes higher/lower than the other
    var switched = false;
    for (var i = 0; i < seriesLength; i++) {
      console.log(i);
      console.log(smallerWindowSMA[i]);
      console.log(largerWindowSMA[i]);
      console.log();
      if (!switched) {
        if (lowerIndicator[i][1] > upperIndicator[i][1]) {
          console.log('switched');
          var orderObj = createTradeOrderObj('SELL', lowerIndicator[i][0])
          flagsArray.push(orderObj);
          switched = true;
        }
      } else {
        // loop until indicators switch back
        if (upperIndicator[i][1] > lowerIndicator[i][1]) {
          console.log('switched');
          var orderObj = createTradeOrderObj('BUY', lowerIndicator[i][0])
          flagsArray.push(orderObj);
          switched = false;
        }
      }
    }
    console.log(flagsArray);
    exports.flags = flagsArray;
    callback(null);
  },

  /* Pull Live Data from Poloniex package every second */
  function (callback) {
    setInterval(function () {
      poloniex.returnTicker(function (err, data) {
        // TODO: add error handling
        lastTickerData = data['USDT_BTC']['last'];
        exports.updatedFinanceData = lastTickerData;
      });
    }, 1000);
  }

], function (err, result) {
  // result now equals 'done'
});
