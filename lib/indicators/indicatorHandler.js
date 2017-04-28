var SMA = require('./sma.js');

function generateSMA(tickerData, options) {
  var timeSeries = SMA(tickerData, options.param);
  return timeSeries;
}

function generateEMA() {
  // TODO
}

function generateBoil() {
  // TODO
}


var indicatorHandler = function (tickerData, options) {

  // Error handling
  if (tickerData == undefined) {
    throw new Error('tickerData is undefined');
  }
  if (options == undefined) {
    throw new Error('options is undefined');
  }


  // Return indicator specified in options.indicator
  if (options.indicator == 'SMA') {
    return generateSMA(tickerData, options);
  }
  else if (options.indicators == 'EMA') {
    return generateEMA(tickerData, options);
  }

}

module.exports = indicatorHandler;
