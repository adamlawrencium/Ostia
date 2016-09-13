// load the things we need
var mongoose = require('mongoose');


// define the schema for our user model
var DataSchema = mongoose.Schema({

    Pol           : {
        currencyPair: [Number],
        last: [Number],
        lowestAsk: [Number],
        highestBid: [Number],
        percentChange: [Number],
        baseVolume : [Number],
        quoteVolume: [Number],
        isFrozen: [Number],
        o24hrHigh: [Number],
        o24hrLow     : [Number]
    }

});


// create the model for users and expose it to our app
module.exports = mongoose.model('Data', DataSchema);
