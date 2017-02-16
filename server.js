/* WELCOME TO THE OSTIA TRADING PLATFORM */

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var async = require('async');
var moment = require('moment');

// Passsing in a sample config
var config = {
  liveTrading: true,
  backtestMode: false,
  strategyName: "simple-arbitrage", // exponential moving average
  exchanges: "all", // exchanges strategy will trade
  pair: "BTCUSD", // or "none" for every pair
  capital: 3000, // starting capital
  timeFrame: 4, // how long to trade
  interval: 1000,
  API_KEYS: {
    poloniex: "123XYZ",
    gdax: "123ABC"
  }
}


// Set up Trading desk and run strategy
//var runLiveTrading = require("./lib/TradingDesk.js");
//runLiveTrading(config);

io.sockets.on('connection', function (socket) {
  async.waterfall([

    /* Initialze data */
    function (callback) {
      var finData = require('./lib/strategies/basicStrategy.js');
      var initialData = finData.initializedFinanceData;
      callback(null, finData, initialData);
    },

    /* emit initialized data */
    function (finData, initialData, callback) {
      socket.emit('initializedChartData', {
        data: initialData
      });
      callback(null, finData);
    },

    /* poll for live data and emit */
    function (finData, callback) {
      // var counter = 0;
      // var eventLooper = setInterval(function () {
      //   var livefeed = finData.updatedFinanceData;
      //   socket.emit('updatedChartData', {
      //     time: new Date().getTime(),
      //     livefeed: livefeed
      //   });
      //   counter++;
      //   if (counter > 3) {
      //     clearInterval(eventLooper);
      //     console.log("###", moment().format());
      //   }
      // }, 5000);
      // callback(null, 'done');
    }
  ], function (err, result) {
    // result now equals 'done'
  });
});

//************************/
//        ROUTES
//* ***********************/

app.use(express.static('client'))

app.get('/', function (req, res) {
  res.sendfile(path.join(__dirname, '/client/html/index.html'))
})

app.get('/dashboard', function (req, res) {
  res.sendfile(path.join(__dirname, '/html/dashboard.html'))
})

app.get('/test', function (req, res) {
  res.sendfile(path.join(__dirname, '/client/html/chartTest.html'))
})

// Creating Express server
server.listen(3000)
