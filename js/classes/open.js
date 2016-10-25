
// Function which takes in a orderbook, and opens a feed of data to that orderbook
let open = function open(orderbook, exchange, pair){
  var info = {
  // Parsing/Setup methods for each exchange
    poloniex : require("./../data-parsing/poloniex.js"),
    kraken : require("./../data-parsing/kraken.js"),
    gdax : require("./../data-parsing/gdax.js"),
    bitfinex : require("./../data-parsing/bitfinex.js")
  }

  var exchangeOrderbook = info[exchange](orderbook)
  exchangeOrderbook.openFeed(pair);
}

module.exports = open;
