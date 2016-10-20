// Poloniex websockets use autobahn, (by my understanding ws plus security)
var autobahn = require('autobahn');

// Local variables
var highbids;
var lowasks;

// Interpret data received
// TODO: Explain (or link to) expected data scheme
function parse(args, kwargs) {
  for (var i=0; i<args.length; i++) {
    var orderBookType = args[i].type;
    var orderType = args[i].data.type;
    var rate = args[i].data.rate
    var amount = args[i].data.amount

    if (orderBookType == "orderBookModify" && orderType == "bid") {
      highbids.set(rate, amount);
    }
    else if (orderBookType == "orderBookModify" && orderType == "ask") {
      lowasks.set(rate, amount);
    }
    else if (orderBookType == "orderBookRemove" && orderType == "bid") {
      highbids.delete(rate);
    }
    else if (orderBookType == "orderBookRemove" && orderType == "ask") {
      lowasks.delete(rate);
    }
  }
}

function openWebSocket() {
  var connection = new autobahn.Connection({
    url: "wss://api.poloniex.com", //Connection address
    realm: "realm1"
    // TODO: Why realm1?
  });
  
  // Subscribing to order book updates, parsing data and calling algorithm
  connection.onopen = function (session) {
    session.subscribe('USDT_BTC', parse);
    //session.subscribe('BTC_ETH', parse);
    //session.subscribe('ticker', parse);
  }
  
  connection.open();
}

// Export constructor that populates highbids and lowasks, returning another
// object with exposed public functions
module.exports = function(exchangeData) {
  highbids = exchangeData.highbids;
  lowasks = exchangeData.lowasks;
  return {
    openWebSocket: openWebSocket
  }
}
