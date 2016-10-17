// Request library to make api calls with
var request = require('request');

// Currency pair to use
var pair = "XXBTZUSD";
//var pair = "XETHXXBT";

// Message sent to subscribe to a currency pair order book, count is number of
// orders sent
var options = {
  url : 'https://api.kraken.com/0/public/Depth',
  form : {
    "pair" : pair,
    "count": 10
  }
};


// Parses data returned from one api call
function parse(error, response, body, callback) {
  // Error Handling
  if (body != undefined) {
    // TODO: The below just checks if the return body is html. Works, but it's
    // bootleg. Actual error handling should actually check the `error` and
    // `response` parameters. A good case to test against is when there's no
    // internet connection and you run the program.
    if (body[0] != '<') {
      var data = JSON.parse(body);
      var bids = data.result[pair].bids;
      var asks = data.result[pair].asks;

      var highbid = new Map();
      for (var i = 0; i < bids.length; i++){
        highbid.set(bids[i][0], bids[i][1]);
      }

      var lowask = new Map();
      for (var i = 0; i < asks.length; i++){
        lowask.set(asks[i][0], asks[i][1]);
      }
      callback(highbid, lowask);
    }
  }
}

// Calls the Kraken API and parses the data
function call(callback) {
  request.post(options, function (error, response, body) {
    parse(error, response, body, callback)
  });
}

// Export the call function
module.exports.call = call;
