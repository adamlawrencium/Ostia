module.exports = function() {

  "use strict";

  var request         = require('request');
  var PUBLIC_API_URL  = 'https://poloniex.com/public';

  // Helper function
  function joinCurrencies(currencyA, currencyB) {
    // If only one arg, then return the first
    if (typeof currencyB !== 'string') {
      return currencyA;
    }
    return currencyA + '_' + currencyB;
  }

  // Constructor
  function Poloniex(){};

  // Prototype
  Poloniex.prototype = {
    constructor: Poloniex,

    // Make an API request
    _request: function(options, callback) {
      if (!('headers' in options)) {
        options.headers = {};
      }

      options.json = true;

      request(options, function(err, response, body) {
        // Empty response
        if (!err && (typeof body === 'undefined' || body === null)){
          err = 'Empty response';
        }
        callback(err, body);
      });

      return this;
    },

    // Make a public API request
    _public: function(command, parameters, callback) {
      var options;

      if (typeof parameters === 'function') {
        callback = parameters;
        parameters = {};
      }

      parameters || (parameters = {});
      parameters.command = command;
      options = {
        method: 'GET',
        url: PUBLIC_API_URL,
        qs: parameters
      };

      options.qs.command = command;
      return this._request(options, callback);
    },

    returnTicker: function(callback) {
      return this._public('returnTicker', callback);
    },

    return24hVolume: function(callback) {
      return this._public('return24hVolume', callback);
    },

    returnOrderBook: function(currencyA, currencyB, callback) {
      var parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB)
      };
      return this._public('returnOrderBook', parameters, callback);
    },

    returnChartData: function(currencyA, currencyB, period, start, end, callback) {
      var parameters = {
        currencyPair: joinCurrencies(currencyA, currencyB),
        period: period,
        start: start,
        end: end
      };
      return this._public('returnChartData', parameters, callback);
    },

    returnCurrencies: function(callback) {
      return this._public('returnCurrencies', callback);
    }

    // TODO: IMPLEMENT PRIVATE API METHODS
  };

  Poloniex.prototype.getTicker = Poloniex.prototype.returnTicker;
  Poloniex.prototype.get24hVolume = Poloniex.prototype.return24hVolume;
  Poloniex.prototype.getOrderBook = Poloniex.prototype.returnOrderBook;
  Poloniex.prototype.getChartData = Poloniex.prototype.returnChartData;

  return Poloniex;
}();
