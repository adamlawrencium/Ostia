// Variable containing availablity and exchange specific pair identifier for
//    all exchanges
// TODO: Begin filling this variable out
var info = {
  poloniex : {
    BTCUSD : "USDT_BTC",
    ETHBTC : "BTC_ETH"
  },
  gdax : {
    BTCUSD : "BTC-USD",
    ETHBTC : "ETH-BTC"
  },
  kraken : {
    BTCUSD : "XXBTZUSD",
    ETHBTC : "XETHXXBT"
  },
  bitfinex : {
    BTCUSD : "BTCUSD",
    ETHBTC : "ETHBTC"
  }
}

// Function which takes in a orderbook-exchange pair, and opens a feed of data
//    to that orderbook-exchange pair
var openFeed = function open(exchange, orderbook) {
  var exchangeOrderbook = require("./exchanges/" + exchange + ".js")(orderbook);
  exchangeOrderbook.openFeed(orderbook.pair);
}

// Orderbook constructor
// TODO: Change maps to javascript objects/combine into one Map/Object
var orderbook = function orderbook(pair) {
  return {
    pair : pair,
    last30Day : [],
    currTopOrderBook : [],
    OrderBook : {},
    highbids : new Map(),
    lowasks : new Map()
  }
}

// Overall Exchanges variable constructor
var createExchanges = function createExchanges (exchangeNames, pairs) {
  var Exchs = {};
  // Accounting for "all" function call
  if (exchangeNames == 'all') {
    exchangeNames = ["poloniex", "gdax", "kraken", "bitfinex"];
  }

  // For each exchange required, creating a Exchange object
  for (var i = 0; i < exchangeNames.length ; i++) {
    if (info[exchangeNames[i] ]) {
        Exchs[exchangeNames[i] ] = addExchange(exchangeNames[i], pairs);
    }
  }

  // Function to open a feed for every exchange/pair needed, loops through every
  //    available key pairs and opens the websocket for that key pair
  Exchs.open = function () {
    for (var key in Exchs) {
      if (Exchs.hasOwnProperty(key)) {
        for (var key_2 in Exchs[key]){
          if (Exchs[key].hasOwnProperty(key_2)) {
            openFeed(key, Exchs[key][key_2]);
          }
        }
      }
    }
  }
  return Exchs;
}

// Single Exchange constructor
var addExchange = function addExchange (exchange, pairs){
  var Exch = {};

  // Accounting for "all" call
  if (pairs == 'all'){
    pairs = [];
    var i = 0;
    for (var key in info[exchange]){
      if (info[exchange].hasOwnProperty(key)) {
        pairs[i] = key;
        i++;
      }
    }
  }

  // Creating a orderbook for every pair requested
  for (var i=0; i<pairs.length ; i++){
    if (info[exchange][pairs[i]]) {
      Exch[pairs[i]] = orderbook(info[exchange][pairs[i]]);
    }
  }
  return Exch;
}

module.exports = createExchanges;
