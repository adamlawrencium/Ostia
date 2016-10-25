// Imported modules
var WebSocket = require('ws');

// Local variables
var highbids;
var lowasks;

// Parse snapshot data from Web Socket
// TODO: Explain (or link to) expected data scheme
function parseSnapshot(data) {
  for (var i = 0; i<data[1].length; i++) {
    if (data[1][i][2] < 0) {
      lowasks.set(data[1][i][0], {rate:parseFloat(data[1][i][1]), amount:parseFloat(data[1][i][2]) })
    }
    else if (data[1][i][2] > 0) {
      highbids.set(data[1][i][0], {rate:parseFloat(data[1][i][1]), amount:parseFloat(data[1][i][2])});
    }
  }
}

// Parse common case data from Web Socket
// TODO: Explain (or link to) expected data scheme
function parse(data) {
  if (data[2] == 0 && data[3] == -1) {
    lowasks.delete(data[1]);
  }
  else if (data[2] == 0 && data[3] == 1) {
    highbids.delete(data[1]);
  }
  else if (data[1] != "hb" && data[3] > 0) {
    highbids.set(data[1], {rate:parseFloat(data[2]), amount:parseFloat(data[3])});
  }
  else if (data[1] != "hb" && data[3] < 0) {
    lowasks.set(data[1], {rate:parseFloat(data[2]), amount:parseFloat(data[3])});
  }
}

// Setting up WS Connection for Bitfinex
function openWebSocket(pair) {
  var ws = new WebSocket('wss://api2.bitfinex.com:3000/ws');

  // When opening the websocket, send subscription message
  var msg = JSON.stringify({
    "event": "subscribe",
    "channel": "book",
    "pair": pair,
    "prec": "R0",
    "len":"25"
  });
  ws.on('open', () => {
    ws.send(msg);
  });

  var counter = 3;

  // TODO: Can we use the flags parameter instead of this counting system?
  ws.on('message', function(data, flags) {
    data = JSON.parse(data);

    // http://docs.bitfinex.com/#websocket

    if (counter > 1) {
      counter--;
    } else if (counter == 1) {
      // Bitfinex 3rd message is a snapshot of the order book
      parseSnapshot(data);
      counter--;
    } else if (counter == 0) {
      parse(data);
    }
  });
}

// Export constructor that populates highbids and lowasks, returning another
// object with exposed public functions
module.exports = function(Exchs) {
  highbids = Exchs.highbids;
  lowasks = Exchs.lowasks;
  return {
    openFeed: openWebSocket
  }
}
