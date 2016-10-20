// Request library to make api calls with
const request = require('request');
// TODO: Explain why this is const?

// Currency pair to use
var pair = "XXBTZUSD";
//var pair = "XETHXXBT";

// Local variables
var highbids;
var lowasks;

function parse(error, response, body) {
  // Error Handling
  if (body != undefined) {
    // TODO: The below just checks if the return body is html. Works, but it's
    // bootleg. Actual error handling should actually check the `error` and
    // `response` parameters. A good case to test against is when there's no
    // internet connection and you run the program.
    // TODO: Explain (or link to) expected data scheme
    if (body[0] != '<') {
      var data = JSON.parse(body);
      var bids = data.result[pair].bids;
      var asks = data.result[pair].asks;

      for (var i = 0; i < bids.length; i++){
        highbids.set(bids[i][0], bids[i][1]);
      }

      for (var i = 0; i < asks.length; i++){
        lowasks.set(asks[i][0], asks[i][1]);
      }
    }
  }
}
// Calls the Kraken API and parses the data
// TODO: So why can't this also use a web socket? If so, link why or explain
// Birch: Kraken does not offer websocket updates https://www.kraken.com/help/api
function call() {
  // Message sent to subscribe to a currency pair order book, count is number of
  // orders sent
  var options = {
    url : 'https://api.kraken.com/0/public/Depth',
    form : {
      "pair": pair,
      "count": 20
    }
  };
  request.post(options, parse);
}

function openCall(){
  // Calls the Kraken API every 1000ms (1s)
  setInterval(call, 1000);
}

// Export constructor that populates highbids and lowasks, setting an interval
// call to kraken to update
module.exports = function(exchangeData) {
  highbids = exchangeData.highbids;
  lowasks = exchangeData.lowasks;



  return {
    openCall: openCall
  }
}
