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
