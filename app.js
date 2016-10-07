// Autobahn Connection Setup
var autobahn = require('autobahn');
var wsuri = "wss://api.poloniex.com";
var connection = new autobahn.Connection({
  url: wsuri,
  realm: "realm1"
});

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


var GDAX_highbid = 0;
var GDAX_lowask = 0;
var Polo_highbid = 0;
var Polo_lowask = 0;

var GDAX_highbid_amt = 0;
var GDAX_lowask_amt = 0;
var Polo_highbid_amt = 0;
var Polo_lowask_amt = 0;


//========SAMPLE GDAX PARSING WITH MAPS=========
var highbid_GDAX = new Map();
var lowask_GDAX = new Map();

// When a message is recieved, log it to the console
ws.on('message', function(data, flags) {

  var tmp_GDAX_highbid = 0;
  var tmp_GDAX_lowask = 1000000000000000;
  var tmp_GDAX_amt_highbid = 0;
  var tmp_GDAX_amt_lowask = 0;


  var data2 = JSON.parse(data)
  if(data2.type == "open" && data2.side == "buy"){
    highbid_GDAX.set(data2.order_id, {rate:data2.price, amount:data2.remaining_size});
  }
  else if(data2.type == "done" && data2.side == "buy"){
    highbid_GDAX.delete(data2.order_id);
  }
  else if(data2.type == "change" && data2.side == "buy"){
    highbid_GDAX(data2.order_id).rate = data2.price;
    highbid_GDAX(data2.order_id).amount = data2.remaining_size;
  }
  else if(data2.type == "open" && data2.side == "sell"){
    lowask_GDAX.set(data2.order_id, {rate:data2.price, amount:data2.remaining_size});
  }
  else if(data2.type == "done" && data2.side == "sell"){
    lowask_GDAX.delete(data2.order_id);
  }
  else if(data2.type == "change" && data2.side == "sell"){
    lowask_GDAX.set(data2.order_id, {rate:data2.price, amount:data2.remaining_size});
  }

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

  // Sorting out the lowest ask
  for (var [key, value] of lowask_GDAX) {
    if (value.rate < tmp_GDAX_lowask){
      tmp_GDAX_lowask = value.rate;
      tmp_GDAX_amt_lowask = parseFloat(value.amount);
    }
    else if (value.rate == tmp_GDAX_lowask){
      tmp_GDAX_amt_highbid += parseFloat(value.amount);
    }
  }
/*
  if (tmp_GDAX_highbid != GDAX_highbid || tmp_GDAX_amt_highbid != GDAX_highbid_amt){
    GDAX_highbid = tmp_GDAX_highbid;
    GDAX_highbid_amt = tmp_GDAX_amt_highbid;
  }

  if (tmp_GDAX_lowask != GDAX_lowask || tmp_GDAX_amt_lowask != GDAX_lowask_amt){
    GDAX_lowask = tmp_GDAX_lowask;
    GDAX_lowask_amt = tmp_GDAX_amt_lowask;
  }
  */

  // Printing out the highest bid and lowest ask
  console.log("High Bid GDAX: " + tmp_GDAX_highbid + "BTC , Amount: " + tmp_GDAX_amt_highbid + " ETH");
  console.log("Low Ask GDAX: " + tmp_GDAX_lowask + "BTC , Amount: " + tmp_GDAX_amt_lowask + " ETH");
  console.log("\n");


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
function on_recieve(args, kwargs){

  if (args[0]=='BTC_ETH'){ // Filtering Ticker results for BTC_ETH

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



//================== POLONIEX DATA PARSING (MAP METHOD) ========================

var highbid = new Map();
var lowask = new Map();

function on_recieve2(args, kwargs){

  // Initializing temporary variables for sorting through the maps
  var tmp_highbid = 0;
  var tmp_lowask = 1000000000000;
  var tmp_amt_highbid = 0;
  var tmp_amt_lowask = 0;

  for (var i=0;i<args.length;i++){
    if(args[i].type=="orderBookModify" && args[i].data.type == "bid"){
      highbid.set(args[i].data.rate, args[i].data.amount);
    }
    else if (args[i].type=="orderBookModify" && args[i].data.type == "ask"){
      lowask.set(args[i].data.rate, args[i].data.amount);
    }
    else if (args[i].type=="orderBookRemove" && args[i].data.type == "bid"){
      highbid.delete(args[i].data.rate);
    }
    else if (args[i].type=="orderBookRemove" && args[i].data.type == "ask"){
      lowask.delete(args[i].data.rate);
    }
  }

  // Sorting out the highest bid
  for (var [key, value] of highbid) {
    if (key>tmp_highbid){
      tmp_highbid = key;
      tmp_amt_highbid = value;
    }
  }

  // Sorting out the lowest ask
  for (var [key, value] of lowask) {
    if (key<tmp_lowask){
      tmp_lowask = key;
      tmp_amt_lowask = value;
    }
  }

/*
if (tmp_highbid != Polo_highbid || tmp_amt_highbid != Polo_highbid_amt){
  Polo_highbid = tmp_highbid;
  Polo_highbid_amt = tmp_amt_highbid;
}

if (tmp_lowask != Polo_lowask || tmp_amt_lowask != Polo_lowask_amt){
  Polo_lowask = tmp_lowask;
  Polo_lowask_amt = tmp_amt_lowask;
}
*/

  // Printing out the highest bid and lowest ask
  console.log("High Bid Poloniex : " + tmp_highbid + "BTC , Amount: " + tmp_amt_highbid + " ETH");
  console.log("Low Ask Poloniex : " + tmp_lowask + "BTC , Amount: " + tmp_amt_lowask + " ETH");
  console.log("\n");

}

// Subscribing to BTC_ETH order book and general ticker updates
connection.onopen = function (session) {

session.subscribe('BTC_ETH', on_recieve2).then(
   function (subscription) {
      // subscription succeeded, subscription is an instance of autobahn.Subscription
   },
   function (error) {
      // subscription failed, error is an instance of autobahn.Error
   }
)

session.subscribe('ticker', on_recieve).then(
   function (subscription) {
      // subscription succeeded, subscription is an instance of autobahn.Subscription
   },
   function (error) {
      // subscription failed, error is an instance of autobahn.Error
   }
)

};

// Opening Autobahn connection
connection.open();

// Creating Express server
server.listen(3000);
