// Imported modules
var WebSocket = require('ws')


var orderbook;

// Parse snapshot data from Web Socket
// TODO: Explain (or link to) expected data scheme
function parseSnapshot(data) {
  for (var i = 0; i<data[1].length; i++) {
    orderbook[data[1][i][0]] = parseFloat(data[1][i][2]);
  }
}

// Parse common case data from Web Socket
// TODO: Explain (or link to) expected data scheme

function parse(data) {
  if (data[2] == 0){
    delete(orderbook[data[1]]);
  }
  else if (data[1] != "hb"){
    orderbook[data[1]] = parseFloat(data[3]);
  }
}

// Setting up WS Connection for Bitfinex
function openWebSocket (pair) {
  var ws = new WebSocket('wss://api2.bitfinex.com:3000/ws')

  // When opening the websocket, send subscription message
  var msg = JSON.stringify({
    "event": "subscribe",
    "channel": "book",
    "pair": pair,
    "prec": "P0",
    "len":"25"
  });
  ws.on('open', () => {
    ws.send(msg)
  })

  var seen_snapshot = false;
  // Flag if the snapshot has been parsed/seen

  ws.on('message', function(data, flags) {

    data = JSON.parse(data);

    // http://docs.bitfinex.com/#websocket
    // If the snapshot is the message being sent, !data.event will return true
    if (!data.event && !seen_snapshot) {
      parseSnapshot(data);
      seen_snapshot = true;
    } else if (seen_snapshot) { //Regular order updates are given after the snapshot
      parse(data);
    }
  })
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
