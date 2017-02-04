var Poloniex  = require('../exchanges/poloniexAPI.js');
var async_    = require('async');
var SMA       = require('../indicators/sma.js');
var currencyPair = 'USDT_BTC';

// initialize poloniex wrapper
poloniex = new Poloniex();

/* THIS FUNCTION INITIALIZES THE TIME SERIES */
var math = require('mathjs');
var d = new Date();
var currentDate = Math.floor((d.getTime() / 1000));
var secsPerDay  = 86400;
var numDays     = 50 * secsPerDay;
var startDate   = currentDate - numDays;

/* TODO: GET RID OF THE UGLIEST NESTED CALLBACK EVER */
poloniex.returnChartData("USDT", "BTC", 86400, startDate, 9999999999, function(err, response) {
  if (err) {
    console.log("error!");
  }
  var initializedTimeSeries = [];
  for (var i = 0; i < response.length; i++) {
    initializedTimeSeries.push(response[i]);
  }
  exports.initializedFinanceData = initializedTimeSeries;
  //console.log('STRATEGY - Initial response:\n',exports.initializedFinanceData);
  //console.log();

  /* THIS FUNCTION UPDATES TIME SERIES */
  var count = 0;
  // TODO: USE WATERFALL OR SERIES OR SOMETHING ELSE
  async_.whilst(
    function() { return count < 5000; },   // this will be replaced with a timer

    /* Body of whilst loop that polls data and produces orders */
    function(callback) {
      //console.log('##########');

      /* poll and analyze returned exchange data */
      poloniex.getTicker(function(err, data) {
        var parsedData = data[currencyPair];

        //var sma_10 = SMA(parsedData, 10);
        //var sma_20 = SMA(parsedData, 20);

        //if (sma_10 < sma_20) {

        //}
        /* Trading logic here:
        1. calculate two moving averages
        2. if one is higher than the other, create order
        3. export indicator and order

        /* export orders and performance data */
        exports.updatedFinanceData = parsedData;
        //console.log(exports.updatedFinanceData);
        //console.log('STRATEGY - Updated response:\n',exports.updatedFinanceData);
        //console.log();
        setTimeout(function() {
          callback(null, count);
        }, 2000);
      });
      count++;
    },

    function (err, n) {
      console.log("FINISHED");
    }
  );
});
