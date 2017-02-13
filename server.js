/* WELCOME TO THE OSTIA TRADING PLATFORM */

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var async = require('async');

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
/*
var server = require('http').Server(app)
var io = require('socket.io')(server)
var path = require('path')
*/

// TODO: Determine which data to send to the client for viz's
// Live trading (performance) data that will be sent to client via Socket.IO

// Set up Trading desk and run strategy
//var runLiveTrading = require("./lib/TradingDesk.js");
//runLiveTrading(config);

// Created to start and stop the liveFeed of a exchange
var liveFeed;

// This sends data to the client for visualizations with socket.io
// Handling the connection to the client through socket.io
/*
async.waterfall([
    function(callback) {
        callback(null, 'one', 'two');
    },
    function(arg1, arg2, callback) {
        // arg1 now equals 'one' and arg2 now equals 'two'
        callback(null, 'three');
    },
    function(arg1, callback) {
        // arg1 now equals 'three'
        callback(null, 'done');
    }
], function (err, result) {
    // result now equals 'done'
});
*/


io.sockets.on('connection', function (socket) {

  var finData = require('./lib/strategies/basicStrategy.js');
  var initialData = finData.initializedFinanceData;

  var _flagCheck = setInterval(function () {
    console.log('waiting...');

    if (typeof initialData !== 'undefined') {
      clearInterval(_flagCheck);

      console.log('SERVER - Initial Data :\n', initialData);
      socket.emit('initializedChartData', {
        data: initialData
      });

      setInterval(function () {
        var livefeed_ = finData.updatedFinanceData;
        console.log('UPDATED DATA:\n', livefeed_);
        socket.emit('updatedChartData', {
          time: new Date().getTime(),
          livefeed: livefeed_
        })
      }, 3000);
    }
  }, 1000);

  // test comment


  // io.socket.on('openExchange', function (data) {
  //   // Creating a live feed to the client of the data requested
  //   liveFeed = setInterval(function () {
  //     var date = new Date()
  //     socket.emit('message', {
  //       message: [Order, date.getTime(), mapParse(allExchangeData[data.data], data.data)]
  //     })
  //   }, 1000)
  // })
  // socket.on('closeExchange', function (data) {
  //   // Closing the current data output
  //   clearInterval(liveFeed);
  // });
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
