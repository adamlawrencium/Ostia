var SMA = require('./sma.js');
var Poloniex = require('poloniex.js');
poloniex = new Poloniex();

var d = new Date();
var currentDate = Math.floor((d.getTime() / 1000));
var secsPerDay = 86400;
var numDays = 30 * secsPerDay;
var startDate = currentDate - numDays;
var period = 86400; // valid values: 300, 900, 1800, 7200, 14400, 86400
var currencyA = "USDT";
var currencyB = "BTC";
var A_B = currencyA + currencyB;
var endDate = 9999999999; // used as most recent time for Poloniex


function generateSMA(tickerData, options) {
    // setTimeout(function () {
    //   console.log('hello');
    // }, 3000);
    // return 'FAKE SMA DATA'
    // return SMA(tickerData, options.param);
}



function generateEMA() {
  // TODO
}

function generateBoil() {
  // TODO
}


var indicatorHandler = function (tickerData, options) {
  return new Promise(function(resolve, reject) {

    poloniex.returnChartData(currencyA, currencyB, period, startDate, endDate, function (err, response) {
      // console.log('### exchange data (candlestick) received.');

      var candlestickData = [];

      if (err) {
        console.log("error!");
      }

      for (var i = 0; i < response.length; i++) {
        candlestickData.push(response[i]);
        // console.log('adding data');
      }

      // console.log(candlestickData);

      // console.log('finished adding data');

      SMA(candlestickData, 10)
      .then(function(timeseriesData){
        return resolve(timeseriesData);
      });

      // return resolve(SMA(candlestickData, 10));

      // setTimeout(function () {
      //   const gen = async() => {
      //     console.log(await generateSMA(tickerData, options));
      //   }
      //   console.log('finidhed long process');
      // }, 3000);

      // generateSMA(tickerData, options));

      // setTimeout(function () {
      //     generateSMA(tickerData, options));
      //     console.log('finidhed long process');
      // }, 3000);

    }); // Close promise

  }); // Close indicator handler


  // // Error handling
  // if (tickerData == undefined) {
  //   throw new Error('tickerData is undefined');
  // }
  // if (options == undefined) {
  //   throw new Error('options is undefined');
  // }
  //
  //
  // // Return indicator specified in options.indicator
  // if (/*options.indicator == 'SMA'*/ true) {
  //
  //
  //
  // }
  // else if (options.indicators == 'EMA') {
  //   return generateEMA(tickerData, options);
  // }

}

console.log('STARTING PROMISE');
indicatorHandler().then(function(timeseriesData){
  console.log(timeseriesData);
});


module.exports = indicatorHandler;
