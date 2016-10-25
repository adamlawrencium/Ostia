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

// Passing in the open function for opening websockets
var open = require("./../classes/open.js");

// Orderbook constructor
// TODO: Change maps to javascript objects
let orderbook = function orderbook(pair) {
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
let subSetExchs = function subSetExchs (exchanges, pairs){
  var Exchs = {};
  // Accounting for "all" function call
  if (exchanges == 'all'){
    exchanges = ["poloniex", "gdax", "kraken", "bitfinex"];
  }

  // For each exchange required, creating a Exchange object
  for (var i=0; i<exchanges.length ; i++){
    if (info[exchanges[i]]){
        Exchs[exchanges[i]] = subSetExch(exchanges[i], pairs);
    }
  }

  // Function to open a feed for every exchange/pair needed
  Exchs["open"] = function () {
    for (var key in Exchs) {
      if (Exchs.hasOwnProperty(key)) {
        for (var key_2 in Exchs[key]){
          if (Exchs[key].hasOwnProperty(key_2)) {
            open(Exchs[key][key_2], key, Exchs[key][key_2]["pair"]);
          }
        }
      }
    }
  }
  return Exchs;
}

// Single Exchange constructor
let subSetExch = function subSetExch (exchange, pairs){
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

module.exports = subSetExchs;
