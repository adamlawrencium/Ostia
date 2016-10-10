// Initializing skipped lists for storing Poloniex orders
var SkipList = require("dsjslib").SkipList
var skl_highbid_polo = new SkipList();
var skl_lowask_polo = new SkipList();

// Autobahn Connection Setup
var autobahn = require('autobahn');
var wsuri = "wss://api.poloniex.com";
var connection = new autobahn.Connection({
  url: wsuri,
  realm: "realm1"
});

// Passing in parsing method from poloniex.js
var parse_polo = require("./data-parsing/poloniex.js").parse;

// Subscribing to BTC_ETH order book updates and parsing data
connection.onopen = function (session) {

  function on_recieve2 (args, kwargs){
    parse_polo(args, skl_highbid_polo, skl_lowask_polo);
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

// When a message is recieved, parse it given the maps
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

// Rendering dashboard.html
app.get('/dashboard', function (req, res) {
  res.sendfile(__dirname + '/dashboard.html');
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

/*
var t = setInterval(GDAX_output,1000);

function GDAX_output (){


var tmp_GDAX_highbid = 0;
var tmp_GDAX_lowask = 1000000000000000;
var tmp_GDAX_amt_highbid = 0;
var tmp_GDAX_amt_lowask = 0;

// Sorting out the highest bid
for (var [key, value] of highbid_GDAX) {
  if (value.rate > tmp_GDAX_highbid){
    tmp_GDAX_highbid = value.rate;
    tmp_GDAX_amt_highbid = parseFloat(value.amount);
  }
  else if (value.rate == tmp_GDAX_highbid){
    tmp_GDAX_amt_highbid += parseFloat(value.amount);
  }
}

for (var [key, value] of lowask_GDAX) {
  if (value.rate < tmp_GDAX_lowask){
    tmp_GDAX_lowask = value.rate;
    tmp_GDAX_amt_lowask = parseFloat(value.amount);
  }
  else if (value.rate == tmp_GDAX_lowask){
    tmp_GDAX_amt_highbid += parseFloat(value.amount);
  }
}




// Printing out the highest bid and lowest ask
console.log("High Bid GDAX: " + tmp_GDAX_highbid + "BTC , Amount: " + tmp_GDAX_amt_highbid + " ETH");
console.log("Low Ask GDAX: " + tmp_GDAX_lowask + "BTC , Amount: " + tmp_GDAX_amt_lowask + " ETH");
console.log("\n");



}

*/

connection.open();

// Creating Express server
server.listen(3000);
