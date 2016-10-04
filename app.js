// Autobahn Connection Setup
var autobahn = require('autobahn');
var wsuri = "wss://api.poloniex.com";
var connection = new autobahn.Connection({
  url: wsuri,
  realm: "realm1"
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

// Sample Order Book Parsing

/*
function on_recieve2(args, kwargs){

  for (var i=0;i<args.length;i++){
    if(args[i].type=="orderBookModify"){
      console.log("type:" + args[i].data.type);
      console.log("rate:" + args[i].data.rate);
      console.log("amount:" + args[i].data.amount);

    }
  }

};
*/
/*
connection.onopen = function (session) {

session.subscribe('BTC_XMR', on_recieve2).then(
   function (subscription) {
      // subscription succeeded, subscription is an instance of autobahn.Subscription
   },
   function (error) {
      // subscription failed, error is an instance of autobahn.Error
   }
)
};
*/


connection.onopen = function (session) {
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
