const mongoose = require('mongoose');
const PoloniexData = require('../models/PoloniexData');

const getTickerData = require('./exchanges/exchangeData')

/**
 * GET /
 * ticker data
 *
 * @param currencyPair
 *
 */
exports.tickerData = (req, res) => {
  const q = req.query;
  getTickerData(q).then(tickerData => {
    res.send({tickerData});
  })
  .catch( err => {
    console.log(err);
  });
};


exports.updatePoloniexData = async (req, res) => {
  const poloData = await (new PoloniexData({"topCurrency": "bob"})).save();
  console.log(poloData);
  res.send({'sup': "man"})
};
