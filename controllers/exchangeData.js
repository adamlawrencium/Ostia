// var Poloniex = require('poloniex.js');
// var polo = new Poloniex();
//
// function getTickerData(q) {
//   return new Promise((resolve, reject) => {
//     var tickerData = [];
//     polo.returnChartData(q.currencyA, q.currencyB, 86400, Math.floor(((new Date()).getTime() / 1000)) - (365 * 86400), 9999999999, (err, data) => {
//       if (err) {
//         throw new Error('data request messed up...')
//       } else {
//         for (var i = 0; i < data.length; i++) {
//           tickerData.push(data[i]);
//         }
//         resolve(tickerData);
//       }
//       reject('Something happened, oh no!');
//     });
//   });
// }


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
