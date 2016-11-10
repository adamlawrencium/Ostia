/* WELCOME TO THE OSTIA TRADING PLATFORM */

var express = require('express');
var app     = express();

var server  = require('http').Server(app);
var io      = require('socket.io')(server);
var path    = require('path');


// TODO: Determine which data to send to the client for viz's
//Live trading (performance) data that will be sent to client via Socket.IO

// Set up Trading desk and run strategy
var runLiveTrading = require("./lib/TradingDesk.js");
runLiveTrading();


// Created to start and stop the liveFeed of a exchange
var liveFeed;

// This sends data to the client for visualizations with socket.io
// Handling the connection to the client through socket.io
io.sockets.on('connection', function (socket) {
  socket.on('openExchange', function(data) {
    // Creating a live feed to the client of the data requested
    liveFeed = setInterval(function() {
      var date = new Date();
      socket.emit('message', { message: [Order,
                                        date.getTime(),
                                        mapParse(allExchangeData[data.data], data.data)]
                                      })
    }, 1000)
  });
  socket.on('closeExchange', function(data) {
    // Closing the current data output
    clearInterval(liveFeed);
  });
});





//************************/
//        ROUTES
//************************/

app.use(express.static('client'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/client/html/index.html');
});

app.get('/dashboard', function (req, res) {
  res.sendfile(__dirname + '/html/dashboard.html');
});

// Creating Express server
server.listen(3000);
