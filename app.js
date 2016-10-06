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

// When a message is recieved, log it to the console
ws.on('message', function(data, flags) {
  //var data2 = JSON.parse(data)
  //console.log(data);
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
  var tmp_lowask = 1;
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

  // Printing out the highest bid and lowest ask
  console.log("High Bid: " + tmp_highbid + "BTC , Amount: " + tmp_amt_highbid + " ETH");
  console.log("Low Ask: " + tmp_lowask + "BTC , Amount: " + tmp_amt_lowask + " ETH");
  console.log("\n");
}

/*
//================== POLONIEX DATA PARSING (ARRAY METHOD) ======================
var highbid = [{rate:0, amount:0},{rate:0, amount:0},{rate:0, amount:0}]
var lowask = [{rate:1, amount:0},{rate:1, amount:0},{rate:1, amount:0}]



function on_recieve2(args, kwargs){

  for (var i=0;i<args.length;i++){
    if(args[i].type=="orderBookModify"){

      if(args[i].data.type == "bid"){

        for (var j=0;j<2;j++){
          if (args[i].data.rate>highbid[j].rate){

            highbid[j+1].rate = highbid[j].rate;
            highbid[j+1].amount = highbid[j].amount;

            highbid[j].rate=args[i].data.rate;
            highbid[j].amount=args[i].data.amount;
            break;
          }
          else if (args[i].data.rate==highbid[j].rate){

            highbid[j].amount=args[i].data.amount;
          }

        }
      }
      else if (args[i].data.type == "ask"){
        for (var j=0;j<2;j++){
          if (args[i].data.rate<lowask[j].rate){
            lowask[j+1].rate = lowask[j].rate;
            lowask[j+1].amount = lowask[j].amount;

            lowask[j].rate=args[i].data.rate;
            lowask[j].amount=args[i].data.amount;
            break;
          }
          else if (args[i].data.rate==lowask[j].rate){
            lowask[j].amount=args[i].data.amount;
          }
        }
      }
    }
    else if(args[i].type=="orderBookRemove"){
      if(args[i].data.type == "bid"){
        for (var j=0;j<2;j++){
          if (args[i].data.rate==highbid[j].rate){
            highbid[j].rate = highbid[j+1].rate;
            highbid[j].amount = highbid[j+1].amount;
            highbid[j+1].rate = 0;
            highbid[j+1].amount = 0;
            break;
          }
        }
      }
      if(args[i].data.type == "ask"){
        for (var j=0;j<2;j++){
          if (args[i].data.rate==lowask[j].rate){
            lowask[j].rate = lowask[j+1].rate;
            lowask[j].amount = lowask[j+1].amount;
            lowask[j+1].rate = 0;
            lowask[j+1].amount = 0;
            break;
          }
        }
      }
    }
  }
  console.log("High Bid: " + highbid[0].rate + "BTC , Amount: " + highbid[0].amount + " ETH");

  console.log("Low Ask: " + lowask[0].rate + "BTC , Amount: " + lowask[0].amount + " ETH");

  console.log("\n");
};

*/

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
