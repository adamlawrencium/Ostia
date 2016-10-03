var autobahn = require('autobahn');
var server = require('../app.js');
io = require('socket.io').listen(server)

//var Data     = require('../mongoose/pol_schema');

var wsuri = "wss://api.poloniex.com";
var connection = new autobahn.Connection({
  url: wsuri,
  realm: "realm1"
});

function on_recieve(args, kwargs){
  console.log(args[0]);
  if (args[0]=='BTC_ETH'){
    io.emit('message',{message: args[2]});
    io.emit('message',{message: args[3]});
    io.emit('message',{message: 'test'});
  }

};


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



connection.onclose = function () {
  console.log("Websocket connection closed");
}


module.exports = connection;
