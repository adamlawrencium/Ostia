const DBPoloniex = require('../models/PoloniexData');
const getTickerData = require('./exchanges/exchangeData');


// HELPER FUNCTIONS //
function getTickDataFromDB(currencyPair) {
  const DBQuery = new Promise((resolve_, reject_) => {
    DBPoloniex.find({ currencyPair }).sort({ date: -1 }).limit(1).then(async (tickDataFromDB) => {
    // If currency isn't found, add it. Else, make sure it's up to date.
      if (tickDataFromDB.length !== 0) {
        console.log(`### ${pair} found in DB.`);
        if (checkAgeOfTickData(tickDataFromDB[0]) !== true) {
        // Update collection by adding missing ticks
          resolve_(await updateDoc(tickDataFromDB[0].date, A, B));
        } else {
          resolve_(`Data for ${tickDataFromDB[0].currencyPair} is up to date.`);
        }
    // Currency pair not found in DB
      } else {
        console.log(`### ${pair} not found in DB.`);
        resolve_(await addNewPairToDBPoloniex(pair, A, B));
      // DBAddNewEntryPromises.push(addNewPairToDBPoloniex(pair, A, B));
      }
    })
    .catch((err) => {
      reject_(err);
      // console.log(err);
    });
  });
}

// CONTROLLERS
/**
 * GET /
 * ticker data
 *
 * @param currencyPair
 *
 */
exports.getTickData = (req, res) => {
  const q = req.query;
  getTickDataFromDB(q.currencyPair).then((tickData) => {
    res.send(tickData);
  });
};

exports.updatePoloniexData = (req, res) => {
  const q = req.query;
  getTickerData(q).then((tickerData) => {
    const entry = {
      baseCurrency: q.currencyA,
      'tradeCurrency': q.currencyB,
      'tickerData': tickerData
    };
    const poloData = (new PoloniexData(entry)).save().then((data) => {
      res.send(data);
    }).catch((err) => {
      console.log('ERROR', err);
    });
  });
};


exports.updatePoloniexDataAPI = (pair, q) => {
  getTickerData(q).then((tickerData) => {
    const entry = {
      'currencyPair': pair,
      baseCurrency: q.currencyA,
      tradeCurrency: q.currencyB,
      'tickerData': tickerData
    };
    const poloData = (new PoloniexData(entry)).save().then((data) => data.message).catch((err) => {
      console.log(err.message);
    });
  });
};
