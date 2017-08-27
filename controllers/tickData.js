const DBPoloniex = require('../models/PoloniexData');

// HELPER FUNCTIONS //

/**
 * Queries the DB for historical ticks for currencyPair
 *
 * @param {string} currencyPair
 * @returns {array} array of objects that contain {date: close} pairs
 */
function getTickDataFromDB(currencyPair) {
  return new Promise((resolve, reject) => {
    console.log(`Querying DB for ${currencyPair}...`);
    DBPoloniex.find({ currencyPair }).sort({ date: -1 })
      .then((tickDataFromDB) => {
        if (tickDataFromDB.length !== 0) {
          const ret = [];
          for (let i = 0; i < tickDataFromDB.length; i++) {
            ret.push([tickDataFromDB[i].date, tickDataFromDB[i].close]);
          }
          resolve(ret);
          console.log(`### ${currencyPair} found in DB.`);
        } else {
          reject(`${currencyPair} not found in DB.`);
          console.log(`### ${currencyPair} not found in DB.`);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// CONTROLLERS
// controllers will sanitize as much as possible for the helper functions
/**
 * GET /
 * ticker data
 *
 * @param currencyPair
 *
 */
exports.getDashboard = (req, res) => {
  console.log(req.query);
  res.render('dashboard', {
    title: 'Dashboard'
  });
};

exports.getTickData = (req, res) => {
  // console.log(req.query);
  const q = `${req.query.currencyA}_${req.query.currencyB}`;
  getTickDataFromDB(q).then((data) => {
    // console.log(data);
    res.json(data);
  });


  // res.render(req.body);

  // const currencyPair = `${req.query.currencyA}_${req.query.currencyB}`;
  // if (!currencyPair) {
  //   getTickDataFromDB(currencyPair).then((tickData) => {
  //     res.render('dashboard', {
  //       tickData,
  //       currencyPair
  //     });
  //   });
  // } else {
  //   res.render('dashboard', {
  //     title: 'Dashboard',
  //     currencyPair
  //   });
  // }
};
