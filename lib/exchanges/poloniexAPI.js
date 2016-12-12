module.exports = function() {

  "use strict";

  var request         = require('request');
  var PUBLIC_API_URL  = 'https://poloniex.com/public';

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
    }
  };

  Poloniex.prototype.getTicker = Poloniex.prototype.returnTicker;

  return Poloniex;
}();
