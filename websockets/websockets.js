var WebSocket = require('ws');
var ws = new WebSocket('ws://www.host.com/path');

var subscribe = {
    "type": "subscribe",
    "product_id": "BTC-USD"
}


ws.on('open', function open() {
  ws.send(subscribe);
});

ws.on('message', function(data, flags) {
  // flags.binary will be set if a binary data is received.
  // flags.masked will be set if the data was masked.
});
