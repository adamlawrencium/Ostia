// Request library to make api calls with
const request = require('request')

// Local variables
var orderbook;
var pair;

function parse (error, response, body) {
  // Error Handling
  if (body !== undefined) {
    // TODO: The below just checks if the return body is html. Works, but it's
    // bootleg. Actual error handling should actually check the `error` and
    // `response` parameters. A good case to test against is when there's no
    // internet connection and you run the program.
    // TODO: Explain (or link to) expected data scheme

    if (body[0] !== '<') {
      for (var prop in orderbook) {
        if (orderbook.hasOwnProperty(prop)) {
           delete orderbook[prop];
        }
      }

      var data = JSON.parse(body);

      var bids = data.result[pair].bids;
      var asks = data.result[pair].asks;

      for (var i = 0; i < bids.length; i++){
        orderbook[bids[i][0]] = parseFloat(bids[i][1]);
        orderbook[asks[i][0]] = -1 * parseFloat(asks[i][1]);
      }
    }
  }
}
// Calls the Kraken API and parses the data
// https://www.kraken.com/help/api
function call () {
  // Message sent to subscribe to a currency pair order book, count is number of
  // orders sent
  var options = {
    url : 'https://api.kraken.com/0/public/Depth',
    form : {
      "pair": pair,
      "count": 25
    }
  };
  request.post(options, parse);

}

function openCallInterval (tmpPair) {
  pair = tmpPair
  // Calls the Kraken API every 1000ms (1s)
  setInterval(call, 1000)
}

// Export constructor that populates highbids and lowasks, setting an interval
// call to kraken to update
// Return openFeed so there is a uniform way of accessing the open data functions

module.exports = function(Exchs) {
  orderbook = Exchs.orderbook;

  return {
    openFeed: openCallInterval
  }
}
