// Autobahn Connection Setup
var autobahn = require('autobahn');
var wsuri = "wss://api.poloniex.com";
var connection = new autobahn.Connection({
  url: wsuri,
  realm: "realm1"
});

// Initializing maps for storing Poloniex orders
var highbid_polo = new Map();
var lowask_polo = new Map();

// Passing in parsing method from poloniex.js
var parse_polo = require("./data-parsing/poloniex.js").parse;

// Subscribing to BTC_ETH order book updates
connection.onopen = function (session) {

  function on_recieve2 (args, kwargs){
    parse_polo(args, highbid_polo, lowask_polo);
  }
  session.subscribe('BTC_ETH', on_recieve2);
  session.subscribe('ticker', on_recieve);

}



// Setting up WS Connection
var WebSocket = require('ws');
var ws = new WebSocket('wss://ws-feed.gdax.com');

// Setting up the subscribe message
var subscribeBTC = {
    "type": "subscribe",
    "product_ids": [
        "BTC-USD",
    ]
};

// Subscribing to heartbeat messages
var heartbeat = {
    "type": "heartbeat",
    "on": true
};

// On websocket connection, send the subscribe and heartbeat JSON strings
ws.on('open',function() {
  ws.send(JSON.stringify(subscribeBTC));
  ws.send(JSON.stringify(heartbeat));
});

//========SAMPLE GDAX PARSING WITH MAPS=========
var highbid_GDAX = new Map();
var lowask_GDAX = new Map();

// Passing in parsing method from poloniex.js
var parse_GDAX = require("./data-parsing/GDAX.js").parse;


// When a message is recieved, log it to the console
ws.on('message', function(data, flags) {

  parse_GDAX(data, highbid_GDAX, lowask_GDAX);

});


// Setting up basic Express server
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// Rendering index.html
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});


// Function for Autobahn websocket feed
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


connection.open();

// Creating Express server
server.listen(3000);
