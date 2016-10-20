// Imported modules
var WebSocket = require('ws');

// Local variables
var highbids;
var lowasks;

// Parse data from Web Socket
// TODO: Explain (or link to) expected data scheme
function parse(data){
  var data = JSON.parse(data)

  // Determine relevant order map to use
  var bidsOrAsks = data.side === "buy" ? highbids : lowasks;

  switch (data.type) {
    case "open":
      bidsOrAsks.set(data.order_id, {
        rate:data.price,
        amount:data.remaining_size
      });
      break;
    case "done":
      bidsOrAsks.delete(data.order_id);
      break;
    case "change":
      bidsOrAsks(data.order_id).rate = data.price;
      bidsOrAsks(data.order_id).amount = data.new_size;
      break;
    case "heartbeat":
    case "received":
    case "match":
      // TODO: Why do these messages get sent? If we can't do anything with
      // them remove this TODO and comment the reason why.
      // console.log(data.type);
      // console.log(data);
      break;
    default:
      console.error("Unexpected data.type!", data.type);
  }
}

// Setting up WS Connection for GDAX
function openWebSocket() {
  var ws = new WebSocket('wss://ws-feed.gdax.com');
  
  // Setting up the subscribe message
  var subscribeBTC = {
    "type": "subscribe",
    "product_ids": [
      "BTC-USD",
      //"ETH-BTC",
    ]
  };
  
  // Subscribing to heartbeat messages
  var heartbeat = {
    "type": "heartbeat",
    "on": true
  };
  
  // On websocket connection, send the subscribe and heartbeat JSON strings
  ws.on('open',function() {
    ws.send(JSON.stringify(subscribeBTC));
    ws.send(JSON.stringify(heartbeat));
  });
  
  // When a message is recieved, parse the data
  ws.on('message', parse);
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
