// Setting up Maps for the highest bids and lowest asks for each exchange
var highbid_krak = new Map();
var lowask_krak = new Map();

var highbid_polo = new Map();
var lowask_polo = new Map();

var highbid_Bit = new Map();
var lowask_Bit = new Map();

var highbid_GDAX = new Map();
var lowask_GDAX = new Map();

// Passing in parsing methods for each exchange
var parse_krak = require("./js/data-parsing/kraken.js").parse;
var parse_polo = require("./js/data-parsing/poloniex.js").parse;
var parse_Bit = require("./js/data-parsing/bitfinex.js").parse;
var parse_GDAX = require("./js/data-parsing/GDAX.js").parse;

var parse_Bit_snap = require("./js/data-parsing/bitfinex_snap.js").parse;
// Required because Bitfinex 3rd message is a snapshot of the order book,
//  this means it must be parsed seperately


//========================KRAKEN API CALL SETUP=================================

var request = require('request'); // Required to send and receive from Kraken
var options = {
  url : 'https://api.kraken.com/0/public/Depth',
  form : {
    "pair" : "XXBTZUSD",
    //"pair" : "XETHXXBT",
    "count": 10
  }
}; //Message sent to subscribe to a currency pair order book, count is number
//    of orders sent


// Found on Stack Exchange, essentially calls a program every 1000ms (1s)
var repeat = setInterval(krak_call, 1000);

// Calls the Kraken API, parses the Data, and runs the arbitrage algorithm
function krak_call(){
  request.post(options, function(error, response, body){

    // Error Handling
  if (body!=undefined){
    if (body[0]!='<'){
    var data = JSON.parse(body);
    parse_krak(data, highbid_krak, lowask_krak);
    output();
    }
  }
  });
}

//========================END KRAKEN API CALL SETUP=============================

//========================POLONIEX WEBSOCKET SETUP==============================

// Poloniex websockets use autobahn, (by my understanding ws plus security)
var autobahn = require('autobahn');
var wsuri = "wss://api.poloniex.com"; //Connection address

var connection = new autobahn.Connection({
  url: wsuri,
  realm: "realm1"
});

// Subscribing to order book updates, parsing data and calling algorithm
connection.onopen = function (session) {

  function on_recieve2 (args, kwargs){
    parse_polo(args, highbid_polo, lowask_polo);
    output();
  }
  session.subscribe('USDT_BTC', on_recieve2);
  session.subscribe('ticker', on_recieve);
  //session.subscribe('BTC_ETH', on_recieve2);
  //session.subscribe('ticker', on_recieve2);
}

//========================END POLONIEX WEBSOCKET SETUP==========================

// Setting up WS Connection for Bitfinex and GDAX
var WebSocket = require('ws');
var ws = new WebSocket('wss://ws-feed.gdax.com');
var ws_bit = new WebSocket('wss://api2.bitfinex.com:3000/ws');

//========================BITFINEX WEBSOCKET SETUP==============================

// Bittrex JSON request
var subscribe_bit = {
  "event": "subscribe",
  "channel": "book",
  "pair": "BTCUSD",
  //"pair": "ETHBTC",
  "prec": "R0",
  "len":"25"
};

// When opening the websocket, send subscription message
ws_bit.on('open',function(){
  ws_bit.send(JSON.stringify(subscribe_bit));
});

// Counter to parse each message seperately
var counter_Bit = 0;

// When receiving a message, parse the data, then call the algorithm
ws_bit.on('message', function(data, flags){
  if(counter_Bit == 2 ) {
    parse_Bit_snap(JSON.parse(data), highbid_Bit, lowask_Bit);
  }
  else if (counter_Bit > 2){
    parse_Bit(JSON.parse(data), highbid_Bit, lowask_Bit);
    output();
  }
  counter_Bit++;
});

//========================END BITFINEX WEBSOCKET SETUP==========================

//========================GDAX WEBSOCKET SETUP==================================
// Setting up the subscribe message
var subscribeBTC = {
  "type": "subscribe",
  "product_ids": [
    "BTC-USD",
    //"ETH-BTC",
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

// When a message is recieved, parse the data and call the algorithm
ws.on('message', function(data, flags) {
  parse_GDAX(data, highbid_GDAX, lowask_GDAX);
  output();
});

//========================END GDAX WEBSOCKET SETUP==============================

// Setting up basic Express server

var express = require('express');
var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

// Rendering index.html
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/html/index.html');
});

// Rendering dashboard.html
app.get('/dashboard', function (req, res) {
  res.sendfile(__dirname + '/html/dashboard.html');
});

app.use('/js', express.static('js'));



// Function for websocket feed for live updating data
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
    io.emit('message',{message: [m.getTime(), args[2], args[3]]});
  }
};

// Passing in algorithm
var arbitrage = require("./js/algorithms/simple_arbitrage.js").output;

var data_all = [highbid_polo, lowask_polo, highbid_GDAX, lowask_GDAX, highbid_Bit, lowask_Bit, highbid_krak, lowask_krak];
function output (){
  arbitrage(data_all);
}

connection.open();

// Creating Express server
server.listen(3000);
