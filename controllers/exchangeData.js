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
};



exports.updatePoloniexDataAPI = (pair, q) => {
  getTickerData(q).then(tickerData => {
    const entry = {
      "currencyPair": pair,
      "baseCurrency": q.currencyA,
      "tradeCurrency": q.currencyB,
      "tickerData": tickerData
    }
    const poloData = (new PoloniexData(entry)).save().then(data => {
      return data.message;
    }).catch( err => {
      console.log(err.message);
    });
  })
};


//  TRYING TO USE ASYNC/AWAIT ....
// exports.updatePoloniexData = async (req, res) => {
//   const q = req.query;
//   getTickerData(q).then(tickerData => {
//     const entry = {
//       "baseCurrency": q.currencyA,
//       "tradeCurrency": q.currencyB,
//       "tickerData": [tickerData]
//     }
//     // let poloData = null;
//     try {
//       var poloData = (await (new PoloniexData(entry)).save());
//       console.log(poloData);
//     } catch (e) {
//       console.log(e);
//     }
//     res.send(poloData)
//   })
// };
