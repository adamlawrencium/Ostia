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
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// Rendering index.html
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/html/index.html');
});

// Rendering dashboard.html
app.get('/dashboard', function (req, res) {
  res.sendfile(__dirname + '/html/dashboard.html');
});

// Function for websocket feed for live updating data
// TODO: Why is this unused anywhere? Is it for future use? If so, explain.
// If not, delete.
/*
function on_recieve(args, kwargs) {
  if (args[0]=='BTC_ETH') { // Filtering Ticker results for BTC_ETH
    // Creating Timestamp for Updated Stock prices
    var m = new Date();
    var dateString =
    m.getUTCFullYear() +"/"+
    ("0" + (m.getUTCMonth()+1)).slice(-2) +"/"+
    ("0" + m.getUTCDate()).slice(-2) + " " +
    ("0" + m.getUTCHours()).slice(-2) + ":" +
    ("0" + m.getUTCMinutes()).slice(-2) + ":" +
    ("0" + m.getUTCSeconds()).slice(-2);

    // Emitting messages to connected clients through socket.io
    io.emit('message',{message: args[2]+", "+args[3]+", "+ m});
  }
};
*/

// Creating Express server
server.listen(3000);
