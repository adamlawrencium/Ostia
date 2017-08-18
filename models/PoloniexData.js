const mongoose = require('mongoose');
/*
 *
 * Poloniex Schema
 *
 * We want a database that will always be updating every 5 minutes with new market data
 *
 */

const poloniexDataSchema = new mongoose.Schema(
  {
    baseCurrency: String,
    tradeCurrency: String,
    tickerData: [{
      date: Number,
      high: Number,
      low: Number,
      close: Number,
      volume: Number,
      quoteVolume: Number,
      weightedAverage: Number
    }]
  },
  { timestamps: true,
    collection: "poloniexdata"
  }
);



const PoloniexData = mongoose.model('PoloniexData', poloniexDataSchema);


module.exports = PoloniexData;
