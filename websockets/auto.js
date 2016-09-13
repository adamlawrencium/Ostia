var autobahn = require('autobahn');

var Data     = require('../mongoose/pol_schema');

var wsuri = "wss://api.poloniex.com";
var connection = new autobahn.Connection({
  url: wsuri,
  realm: "realm1"
});

connection.onopen = function (session) {

	function tickerEvent (args,kwargs) {

    console.log(args[0]);

    var temp = new Data({
        currencyPair: args[0],
       last: args[1],
       lowestAsk: args[2],
       highestBid: args[3],
       percentChange: args[4],
       baseVolume: args[5],
       quoteVolume: args[6],
       isFrozen: args[7],
       o24hrHigh: args[8],
       o24hrLow: args[9]
     });

     temp.save(function (err, temp) {
       if (err) return console.error(err);

     });



		//console.log(args);

	}



	//session.subscribe('BTC_XMR', marketEvent);
  session.subscribe('ticker', tickerEvent);

}

connection.onclose = function () {
  console.log("Websocket connection closed");
}


module.exports = connection;
