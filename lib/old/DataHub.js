// Variable containing availablity and exchange specific pair identifier for
//    all exchanges
// TODO: Begin filling this variable out
var info = {
  poloniex: {
    BTCUSD: 'USDT_BTC',
    ETHBTC: 'BTC_ETH'
  },
  gdax: {
    BTCUSD: 'BTC-USD',
    ETHBTC: 'ETH-BTC'
  },
  kraken: {
    BTCUSD: 'XXBTZUSD',
    ETHBTC: 'XETHXXBT'
  },
  bitfinex: {
    BTCUSD: 'BTCUSD',
    ETHBTC: 'ETHBTC'
  }
}

// Function which takes in a orderbook-exchange pair, and opens a feed of data
//    to that orderbook-exchange pair
var openFeed = function open (exchange, orderbook) {
  var exchangeOrderbook = require('./exchanges/' + exchange + '.js')(orderbook)
  exchangeOrderbook.openFeed(orderbook.pair)
}

// Orderbook constructor
// TODO: Change maps to javascript objects/combine into one Map/Object
var orderbook = function orderbook (pair) {
  return {
    pair: pair,
    last30Day: [],
    currTopOrderBook: [],
    orderbook:        {},
  }
}

// Overall Exchanges variable constructor
var createExchanges = function createExchanges (exchangeNames, pairs) {
  var Exchanges = {}
  // Accounting for "all" function call
  if (exchangeNames === 'all') {
    exchangeNames = ['poloniex', 'gdax', 'kraken', 'bitfinex']
  }

  // For each exchange required, creating a Exchange object
  for (var i = 0; i < exchangeNames.length; i++) {
    if (info[exchangeNames[i]]) {
      Exchanges[exchangeNames[i]] = addExchange(exchangeNames[i], pairs)
    }
  }

  // Function to open a feed for every exchange/pair needed, loops through every
  //    available key pairs and opens the websocket for that key pair
  Exchanges.open = function () {
    for (var exchName in Exchanges) {
      if (Exchanges.hasOwnProperty(exchName)) {
        for (var currencyPair in Exchanges[exchName]) {
          if (Exchanges[exchName].hasOwnProperty(currencyPair)) {
            openFeed(exchName, Exchanges[exchName][currencyPair])
          }
        }
      }
    }
  }
  return Exchanges
}

// Single Exchange constructor
var addExchange = function addExchange (exchange, pairs) {
  var Exch = {}

  // Accounting for "all" call
  if (pairs === 'all') {
    pairs = []
    let i = 0
    for (var key in info[exchange]) {
      if (info[exchange].hasOwnProperty(key)) {
        pairs[i] = key
        i++
      }
    }
  }

  // Creating a orderbook for every pair requested
  for (let i = 0; i < pairs.length; i++) {
    if (info[exchange][pairs[i]]) {
      Exch[pairs[i]] = orderbook(info[exchange][pairs[i]])
    }
  }
  return Exch
}

module.exports = createExchanges
