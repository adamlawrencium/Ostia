// Imported modules
var WebSocket = require('ws')
var request = require('request')
var mapParse = require('./map-parsing.js')

// Local variables
var highbids
var lowasks

// Function to parse the GDAX snapshot
function parseSnap (data) {
  var count = 100 // Number of orders to take from snapshot
  for (var i = 0; i < count; i++) {
    highbids.set(data.bids[i][2], {
      rate: parseFloat(data.bids[i][0]),
      amount: parseFloat(data.bids[i][1])
    })
    lowasks.set(data.asks[i][2], {
      rate: parseFloat(data.asks[i][0]),
      amount: parseFloat(data.asks[i][1])
    })
  }
}

// Parse data from Web Socket
// TODO: Explain (or link to) expected data scheme
function parse (data) {
  data = JSON.parse(data)

  // Determine relevant order map to use
  var bidsOrAsks = data.side === 'buy' ? highbids : lowasks

  switch (data.type) {
    case 'open':
      bidsOrAsks.set(data.order_id, {
        rate: parseFloat(data.price),
        amount: parseFloat(data.remaining_size)
      })
      break
    case 'done':
      bidsOrAsks.delete(data.order_id)
      break
    case 'change':
      if (bidsOrAsks.get(data.order_id) !== undefined) {
        bidsOrAsks(data.order_id).rate = parseFloat(data.price)
        bidsOrAsks(data.order_id).amount = parseFloat(data.new_size)
        bidsOrAsks(data.order_id).amount = parseFloat(data.new_funds)
      }
      break
    case 'heartbeat':
    case 'received':
    case 'match':
      // TODO: Why do these messages get sent? If we can't do anything with
      // them remove this TODO and comment the reason why.
      break
    default:
      console.error('Unexpected data.type!', data.type)
  }
}

// Setting up WS Connection for GDAX
function openWebSocket (pair) {
  var ws = new WebSocket('wss://ws-feed.gdax.com')

  // Setting up the subscribe message
  var subscribeBTC = {
    'type': 'subscribe',
    'product_ids': [
      pair
    ]
  }

  // Subscribing to heartbeat messages
  var heartbeat = {
    'type': 'heartbeat',
    'on': true
  }

  // Variables for snapshot parsing
  var url = 'https://api.gdax.com/products/' + pair + '/book?level=3'
  var options = {
    url: url,
    headers: {
      'User-Agent': 'request'
    }
  }

  // Calling a order book snapshot request and parsing it
  request(options, function (error, response, body) {
    parseSnap(JSON.parse(body))
  })

  // On websocket connection, send the subscribe and heartbeat JSON strings
  ws.on('open', function () {
    ws.send(JSON.stringify(subscribeBTC))
    ws.send(JSON.stringify(heartbeat))
  })

  // When a message is recieved, parse the data
  ws.on('message', parse)
}

// Export constructor that populates highbids and lowasks, returning another
// object with exposed public functions
// Return openFeed so there is a uniform way of accessing the open data functions
module.exports = function (Exchs) {
  highbids = Exchs.highbids
  lowasks = Exchs.lowasks
  return {
    openFeed: openWebSocket
  }
}
