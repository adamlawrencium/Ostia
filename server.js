// Map exchange to index number to use for rest of data structures
var allExchangeData = {
  kraken: null,
  poloniex: null,
  gdax: null,
  bitfinex: null,
}

// Setting up Maps for the highest bids and lowest asks for each exchange
// TODO: Why maps? Could use objects as well?
for (var name in allExchangeData) {
  if (allExchangeData.hasOwnProperty(name)) {
    allExchangeData[name] = {
      highbids: new Map(),
      lowasks: new Map(),
    }
  }
}

// Parsing/Setup methods for each exchange
var kraken = require("./js/data-parsing/kraken.js")(allExchangeData.kraken);
var poloniex = require("./js/data-parsing/poloniex.js")(allExchangeData.poloniex);
var gdax = require("./js/data-parsing/gdax.js")(allExchangeData.gdax);
var bitfinex = require("./js/data-parsing/bitfinex.js")(allExchangeData.bitfinex);

// Setup and open the web sockets
poloniex.openWebSocket();
bitfinex.openWebSocket();
gdax.openWebSocket();

// Setting up map parsing to get info from exchanges for live chart
var mapParse = require("./js/data-parsing/map_parsing.js");

// Outputs the data every 1000ms (1s)
var arbitrage = require("./js/algorithms/simple_arbitrage.js");
setInterval(function() {

  // Don't pass to arbitrage unless all data is initialized. Put in because
  // Kraken data isn't initialized the first time this is called.
  for (var name in allExchangeData) {
    if (allExchangeData.hasOwnProperty(name) && !allExchangeData[name]) {
      return;
    }
  }

  arbitrage(allExchangeData);
}, 1000);

// Setting up basic Express server

var express = require('express');
var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
// TODO: What is this?

// Created to start and stop the liveFeed of a exchange
var liveFeed;

// Handling the connection to the client through socket.io
io.sockets.on('connection', function (socket) {

  socket.on('openExchange', function(data){
    // Creating a live feed to the client of the data requested
    liveFeed = setInterval(function() {
      var date = new Date();
      socket.emit('message', {message: [date.getTime(), mapParse(allExchangeData[data.data], data.data)]})
    }, 1000)
  });
  socket.on('closeExchange', function(data){
    // Closing the current data output
    clearInterval(liveFeed);
  });
});

// Rendering index.html
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/html/index.html');
});

// Rendering dashboard.html
app.get('/dashboard', function (req, res) {
  res.sendfile(__dirname + '/html/dashboard.html');
});

app.use('/js', express.static('js'));

// Creating Express server
server.listen(3000);
