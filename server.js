/* WELCOME TO THE OSTIA TRADING PLATFORM */
"use strict";

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var async = require('async');
var chalk = require('chalk');
var fs = require('fs');

// Dummy config that the client would pass into a strategy file
var config = {
  strategyName: 'My SMA strategy',
  currencyA: 'USDT',
  currencyB: 'BTC',
  reqData: {
    period: 86400,
    startDate: Math.floor(((new Date()).getTime() / 1000)) - (100 * 86400),
    endDate: 9999999999,
  },
  indicators: [{
    indicator: 'SMA',
    parameter: 10
  }, {
    indicator: 'SMA',
    parameter: 25
  }],
  backtest: {
    backtestRequested: true,
    startingCapital: 1000
  }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
var DataHandler = require('./lib/DataHandler.js');
var AbstractStrategy = require('./lib/AbstractStrategy.js');

io.sockets.on('connection', (socket) => {
  console.log(chalk.green(`New client connected at ${Date()}`));
  // io.sockets.on('createNewStrategy', (strategyRequest) => {

  var data_handler = new DataHandler(config);
  data_handler.getFinancialData().then(data => {
    var strategy = new AbstractStrategy(config, data);

    // exportData = tickerData, backtest, benchmark, orders, indicators
    var exportData = strategy.getTradeOrders();

    socket.emit('initializedChartData', {
      tickerData: exportData.tickerData,
      indicators: exportData.indicators,
      flags: exportData.orders,
    });
    socket.emit('backtest', {
      backtest: exportData.backtest,
      benchmark: exportData.benchmark
    });
  }).catch(err => {
    console.log(err);
  });
});
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //


io.sockets.on('$$$connection', function (socket) {
  console.log(`New client connected at ${Date()}`);
  async.waterfall([

    /* Initialze data */
    function (callback) {
      var financialData = require('./lib/strategies/basicStrategy.js');
      var candlestickData = financialData.candlestickData;
      var indicators = financialData.indicators;
      var flags = financialData.flags;
      var backtest = financialData.backtest;
      var benchmark = financialData.benchmark;
      callback(null, candlestickData, indicators, financialData, flags, backtest, benchmark);
    },

    /* emit initialized data */
    function (candlestickData, indicators, financialData, flags, backtest, benchmark, callback) {
      socket.emit('initializedChartData', {
        candlestickData: candlestickData,
        indicators: indicators,
        flags: flags,
        backtest: backtest
      });
      socket.emit('chartFlags', {
        flags: null
      });
      socket.emit('backtest', {
        backtest: backtest,
        benchmark: benchmark
      });
      callback(null, financialData);
    },

    /* poll for live data and emit */
    function (financialData, callback) {
      // var counter = 0;
      // var eventLooper = setInterval(function () {
      //   var mostRecentTickerPrice = financialData.updatedFinanceData;
      //   socket.emit('updatedChartData', {
      //     time: new Date().getTime(),
      //     mostRecentTickerPrice: parseFloat(mostRecentTickerPrice)
      //   });
      //   console.log("### SERVER: " + Date.now() + ": live data point sent")
      // }, 5000);
    }

  ], function (err, result) {
    // result now equals 'done'
  });
});

//************************/
//        ROUTES
//* ***********************/

app.use(express.static('client'))

app.get('/1', function (req, res) {
  res.sendfile(path.join(__dirname, '/client/html/index.html'))
})

app.get('/', function (req, res) {
  res.sendfile(path.join(__dirname, '/client/pages/index.html'))
})

app.get('/test', function (req, res) {
  res.sendfile(path.join(__dirname, '/client/html/chartTest.html'))
})

// Creating Express server
server.listen(3000);

fs.readFile('./lib/ascii-logo.txt', "utf8", function (error, data) {
  console.log(data);
})
