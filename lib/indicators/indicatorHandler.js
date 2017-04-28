var SMA = require('./sma.js');
var Poloniex = require('poloniex.js');
poloniex = new Poloniex();

function generateSMA(tickerData, options) {
    setTimeout(function () {
      console.log('hello');
    }, 3000);
    return 'hello'
    //var timeSeries = SMA(tickerData, options.param);
}



function generateEMA() {
  // TODO
}

function generateBoil() {
  // TODO
}


var indicatorHandler = function (tickerData, options) {

  poloniex.returnChartData(currencyA, currencyB, period, startDate, endDate, function (err, response) {
    console.log('### exchange data (candlestick) received.');
    var candlestickData = [];
    if (err) {
      console.log("error!");
    }
    for (var i = 0; i < response.length; i++) {
      candlestickData.push(response[i]);
    }

    const gen = async() => {
      console.log(await generateSMA(tickerData, options));
    }

  });


  // Error handling
  if (tickerData == undefined) {
    throw new Error('tickerData is undefined');
  }
  if (options == undefined) {
    throw new Error('options is undefined');
  }


  // Return indicator specified in options.indicator
  if (/*options.indicator == 'SMA'*/ true) {



  }
  else if (options.indicators == 'EMA') {
    return generateEMA(tickerData, options);
  }

}

indicatorHandler()
module.exports = indicatorHandler;
