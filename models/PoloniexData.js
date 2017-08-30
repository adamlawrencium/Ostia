const mongoose = require('mongoose');
/*
 *
 * Poloniex Schema
 *
 * We want a database that will always be updating every 5 minutes with new market data
 *
 */

const poloniexDataSchema__ = new mongoose.Schema(
  {
    currencyPair: { type: String, required: true },
    baseCurrency: String,
    tradeCurrency: String,
    tickData: [{
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
    collection: 'poloniexdata'
  }
);

const poloniexDataSchema = new mongoose.Schema(
  {
    currencyPair: { type: String, required: true },
    baseCurrency: String,
    tradeCurrency: String,
    date: Number,
    high: Number,
    low: Number,
    close: Number,
    volume: Number,
    quoteVolume: Number,
    weightedAverage: Number },
  { timestamps: true,
    collection: 'poloniexdata'
  }
);


const PoloniexData = mongoose.model('PoloniexData', poloniexDataSchema);


module.exports = PoloniexData;
