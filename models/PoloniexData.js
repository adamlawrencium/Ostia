const mongoose = require('mongoose');
/*
 *
 * Poloniex Schema
 *
 * We want a database that will always be updating every 5 minutes with new market data
 *
 */

const poloniexDataSchema = new mongoose.Schema({

  topCurrency: String

}, { timestamps: true });



const PoloniexData = mongoose.model('PoloniexData', poloniexDataSchema);


module.exports = PoloniexData;
