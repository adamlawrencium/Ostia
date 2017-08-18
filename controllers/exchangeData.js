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


exports.updatePoloniexData = (req, res) => {
  const q = req.query;

  getTickerData(q).then(tickerData => {
    const entry = {
      "baseCurrency": q.currencyA,
      "tradeCurrency": q.currencyB,
      "tickerData": tickerData
    }
    const poloData = (new PoloniexData(entry)).save().then(data => {
      res.send(data);
    }).catch( err => {
      console.log('ERROR', err);
    });

  })

  // console.log(entry);
  // const poloData = await (new PoloniexData(entry)).save();
  // console.log(poloData);
  // res.send({'sup': "man"})
};
//
// exports.updatePoloniexData = async (req, res) => {
//   const q = req.query;
//   getTickerData(q).then(tickerData => {
//     const entry = {
//       "baseCurrency": q.currencyA,
//       "tradeCurrency": q.currencyB,
//       "tickerData": tickerData
//     }
//     const poloData = await (new PoloniexData(entry)).save();
//     console.log(poloData);
//     res.send({poloData});
//   })
//   .catch( err => {
//     console.log(err);
//   });
//
// };
