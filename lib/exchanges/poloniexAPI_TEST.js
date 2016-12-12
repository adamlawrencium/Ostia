var Poloniex = require('./poloniexAPI.js');

// Create a new instance
poloniex = new Poloniex();

// Public call
poloniex.getTicker(function(err, data){
    if (err){
        console.log('ERROR', err);
        return;
    }
    console.log(data);
});
