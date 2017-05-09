// Imported modules
var WebSocket = require('ws')
var request = require('request')
var mapParse = require('./map-parsing.js')

// Local variables
var orderbook;
var min = .00000000001;

// Function to parse the GDAX snapshot
function parseSnap(data){
    var count = 25; // Number of orders to take from snapshot
    for (var i = 0; i < count; i++){
      orderbook[parseFloat(data.bids[i][0])] = parseFloat(data.bids[i][1]);
      orderbook[parseFloat(data.asks[i][0])] = -1 * parseFloat(data.asks[i][1]);
    }

}

// Parse data from Web Socket
// TODO: Explain (or link to) expected data scheme

function parse(data){

  var data = JSON.parse(data)
  var bidAskMult = 1;
  // Simplifying for one orderbook template
  if (data.side == "sell"){
    bidAskMult = -1;
  }
  var key = parseFloat(data.price);
  switch (data.type) {
    case "open":
      if(orderbook.hasOwnProperty(key)){
        orderbook[key] += bidAskMult * parseFloat(data.remaining_size);
      }
      else {
        orderbook[key] = bidAskMult * parseFloat(data.remaining_size);
      }
      break;
    case "done":
      if (orderbook.hasOwnProperty(key)){
        var tmp = parseFloat(orderbook[key]);
        delete(orderbook[key]);
        orderbook[key] = tmp - (bidAskMult * parseFloat(data.remaining_size));
        if ((bidAskMult * orderbook[key]) < min){
          delete(orderbook[key]);
        }
      }
      break;
    case "match":
      if (orderbook.hasOwnProperty(key)){
        var tmp = parseFloat(orderbook[key]);

        delete(orderbook[key]);
        orderbook[key] = tmp - (bidAskMult * parseFloat(data["size"]));

        if ((bidAskMult * orderbook[key]) < min){
          delete(orderbook[key]);
        }
      }
      break;
    case "change":
      if (orderbook.hasOwnProperty(key)){
        var tmp = parseFloat(orderbook[key]);
        delete(orderbook[key]);

        orderbook[key] = tmp - (bidAskMult * (parseFloat(data.old_size) - parseFloat(data.new_size)));
      }
      break;
    case 'heartbeat':
      break;
    case 'received':
      break;
    // These message are for level 3 orderbooks, we only need level 2
    default:
      console.error("Unexpected data.type!", data.type);
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
  var snapUrl = "https://api.gdax.com/products/"+ pair + "/book?level=2";
  var options = {
    url: snapUrl,
    headers: {
      'User-Agent': 'request'
    }
  }

  // Calling a order book snapshot request and parsing it
  request(options, function(error, response, body) {
    parseSnap(JSON.parse(body));

  });

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
module.exports = function(Exchs) {
  orderbook = Exchs.orderbook;
  return {
    openFeed: openWebSocket
  }
}
