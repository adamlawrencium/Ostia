// Passing required modules
var autobahn = require('autobahn');
var request = require('request');

// Local variables
var highbids;
var lowasks;
var count = 50; // Number of orders to receive

// Function to parse snapshot of order book data from Poloniex
function snapParse(data){
  for (var i = 0; i < count; i++){
    highbids.set(parseFloat(data.bids[i][0]), parseFloat(data.bids[i][1]));
    lowasks.set(parseFloat(data.asks[i][0]), parseFloat(data.asks[i][1]));
  }
}

// Interpret data received
// TODO: Explain (or link to) expected data scheme
function parse(args, kwargs) {
  for (var i=0; i<args.length; i++) {
    var orderBookType = args[i].type;
    var orderType = args[i].data.type;
    var rate = args[i].data.rate
    var amount = args[i].data.amount

    if (orderBookType == "orderBookModify" && orderType == "bid") {
      highbids.set(parseFloat(rate), parseFloat(amount));
    }
    else if (orderBookType == "orderBookModify" && orderType == "ask") {
      lowasks.set(parseFloat(rate), parseFloat(amount));
    }
    else if (orderBookType == "orderBookRemove" && orderType == "bid") {
      highbids.delete(rate);
    }
    else if (orderBookType == "orderBookRemove" && orderType == "ask") {
      lowasks.delete(rate);
    }
  }
}

function openWebSocket(pair) {
  var connection = new autobahn.Connection({
    url: "wss://api.poloniex.com", //Connection address
    realm: "realm1"
    // http://pastebin.com/dMX7mZE0 , http://autobahn.ws/js/reference.html#connection-options
  });

  // Subscribing to order book updates, parsing data and calling algorithm
  connection.onopen = function (session) {
    session.subscribe( pair , parse);
  }

  connection.open();

  // Variables for snapshot API call
  var url = "https://poloniex.com/public?command=returnOrderBook&currencyPair=" + pair + "&depth="+ count;

  // When opening websocket, call API for a snapshot of the order book
  request(url, function (error, response, body) {
    // Parsing snapshot of order book
    snapParse(JSON.parse(body));
  });
}

// Export constructor that populates highbids and lowasks, returning another
// object with exposed public functions
module.exports = function(Exch) {
  highbids = Exch.highbids;
  lowasks = Exch.lowasks;
  return {
    openFeed: openWebSocket
  }
}
