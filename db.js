/*
This file does two things:
1. Initialize the DB with historical Poloniex data.
2. Update the DB at a certain interval (5 minutes usually)
 */
const schedule = require('node-schedule');
const Poloniex = require('poloniex.js');
const DBPoloniex = require('./models/PoloniexData');

const polo = new Poloniex();
const GRANULARITY = 86400;

// 300, 900, 1800, 7200, 14400, 86400 // 1503014400
function getTickData(currencyA, currencyB) {
  return new Promise((resolve, reject) => {
    const tickData = [];
    polo.returnChartData(currencyA, currencyB, GRANULARITY, 1000000000, 9999999999, (err, data) => {
      if (err) {
        console.log('### ERROR getting historical tick data for', (`${currencyA}_${currencyB}`));
        console.log('### Trying again to get historical data for', (`${currencyA}_${currencyB}`));
        polo.returnChartData(currencyA, currencyB, GRANULARITY, 1000000000, 9999999999, (err_, data_) => {
          if (err_) {
            console.log('### SECOND ERROR getting historical tick data for', (`${currencyA}_${currencyB}`));
            console.log(err_);
            reject(err_);
          } else {
            for (let i = 0; i < data_.length; i++) {
              tickData.push(data_[i]);
            }
            resolve(tickData);
          }
        });
        reject(err);
      } else {
        for (let i = 0; i < data.length; i++) {
          tickData.push(data[i]);
        }
        resolve(tickData);
      }
    });
  });
}

function addNewPairToDBPoloniex(pair, currencyA, currencyB) {
  return new Promise(async (resolve, reject) => {
    console.log(`### Adding ${pair} to DB. Getting tick data...`);
    let tickData;
    try {
      tickData = await getTickData(currencyA, currencyB);
    } catch (e) {
      console.log(e);
      reject(e);
    }

    console.log('### Recieved data for', pair, `[${tickData.length}] points`);
    const bulkWriteToDB = [];
    for (let i = 0; i < tickData.length; i++) {
      const entry = {
        currencyPair: pair,
        baseCurrency: currencyA,
        tradeCurrency: currencyB,
        date: tickData[i].date,
        high: tickData[i].high,
        low: tickData[i].low,
        close: tickData[i].close,
        volume: tickData[i].volume,
        quoteVolume: tickData[i].quoteVolume,
        weightedAverage: tickData[i].weightedAverage
      };
      bulkWriteToDB.push(entry);
    }
    try {
      console.log(`### Adding ${bulkWriteToDB.length} new entries to the DB...`);
      await DBPoloniex.insertMany(bulkWriteToDB);
      console.log(`### SUCCESS: ${bulkWriteToDB.length} new entries for ${pair} was saved to DB`);
      resolve((`SUCCESS: ${bulkWriteToDB.length} new entries for ${pair} was saved to DB`));
    } catch (e) {
      console.log('### ERROR: Couldn\'t save data.');
      console.log(e);
      reject(e);
    }
  });
}


/**
 * Gets the current orderbook from Poloniex.
 * @returns a promise with an array of currencyPair objects
 */
function getCurrentOrderbook() {
  return new Promise((resolve, reject) => {
    console.log('### Getting current orderbook...');
    polo.getTicker((err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const ret = [];
      Object.keys(data).forEach((currencyPair) => {
        ret.push({ [currencyPair]: data[currencyPair] });
      });
      // console.log(ret);
      resolve(ret);
    });
  });
}


/**
 * See's if most recent tick is older than a certain age (GRANULARITY)
 *
 * @param {array} tickData array of all the tick data for a currency
 * @returns {asdfas}
 */
function checkAgeOfTickData(tick) {
  const age = Math.floor((new Date().getTime() / 1000) - tick.date);
  if (age <= GRANULARITY) {
    console.log(`### Data for ${tick.currencyPair} is up to date (${age} seconds)`);
    return true;
  }
  console.log(`### Data for ${tick.currencyPair} is ${age} seconds (${Math.floor(age / 60)} minutes) old!`);
  return false;
}


/**
 * Updages MongoDB currency collection with missing ticks
 *
 * @param {any} tickData array of mongodb objects
 * @param {any} currencyA first currency
 * @param {any} currencyB seccond currency
 * @returns a promise
 */
function updateDoc(mostRecentTick, currencyA, currencyB) {
  return new Promise(async (resolve, reject) => {
    const startTime = mostRecentTick + GRANULARITY;
    const newData = [];
    polo.returnChartData(currencyA, currencyB, GRANULARITY, startTime, 9999999999, async (err, data) => {
      if (err) {
        console.log('### ERROR getting historical tick data for', (`${currencyA}_${currencyB}`));
        reject(err);
      } else {
        for (let i = 0; i < data.length; i++) {
          newData.push(data[i]);
        }
      }
      const bulkWriteToDB = [];
      for (let i = 0; i < newData.length; i++) {
        const entry = {
          currencyPair: (`${currencyA}_${currencyB}`),
          baseCurrency: currencyA,
          tradeCurrency: currencyB,
          date: newData[i].date,
          high: newData[i].high,
          low: newData[i].low,
          close: newData[i].close,
          volume: newData[i].volume,
          quoteVolume: newData[i].quoteVolume,
          weightedAverage: newData[i].weightedAverage
        };
        bulkWriteToDB.push(entry);
      }
      try {
        console.log('### Updating entry to the DB...');
        await DBPoloniex.insertMany(bulkWriteToDB);
        console.log(`### SUCCESS: Data for ${currencyA}_${currencyB} was updated to DB`);
        resolve((`SUCCESS: Data for ${currencyA}_${currencyB} was updated to DB`));
      } catch (e) {
        console.log('### ERROR: Couldn\'t update data.');
        console.log(e);
        reject(e);
      }
    });
  });
}

exports.dbInitializer = async function () {
  return new Promise(async (resolve, reject) => {
    const choice = 2;
    if (choice === 0) {
      console.log('### Clearing out database...');
      DBPoloniex.deleteMany({})
      .then((data) => {
        resolve(`Deleted ${data.deletedCount} elements`);
        process.exit(0);
      });
    } else if (choice === 1) {
      resolve('Skipping DB update');
    } else {
      let orderbook;
      try {
        // Get the current Poloniex orderbook
        orderbook = await getCurrentOrderbook();
        console.log('### Recieved orderbook.');
      } catch (e) {
        console.log(e);
        reject(e);
      }

      // Find if each currency exists in our MongoDB
      const DBQueries = [];
      for (let i = 0; i < orderbook.length; i++) {
        const pair = Object.keys(orderbook[i])[0];
        const AB = pair.split('_'); const A = AB[0]; const B = AB[1];
        // Find the most recent document (tick) for a currency
        console.log(`### Querying DB for ${pair}...`);
        const DBQuery = new Promise((resolve_, reject_) => {
          DBPoloniex.find({ currencyPair: pair }).sort({ date: -1 }).limit(1)
          .then(async (tickDataFromDB) => {
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
            }
          })
          .catch((err) => {
            reject_(err);
          });
        });
        DBQueries.push(DBQuery);
      }
      let DBUpdateResolves;
      try {
        DBUpdateResolves = await Promise.all(DBQueries);
        resolve(DBUpdateResolves);
        resolve();
      } catch (e) {
        console.log(e);
        reject(DBUpdateResolves);
      }
    }
  });
};

exports.dbUpdater = function () {
  // Job runs at the top of every 5 minutes
  schedule.scheduleJob('*/5 * * * *', async () => {
    console.log(`### ${new Date()} Updating DB with new Poloniex data...`);
    let orderbook = null;
    try {
      orderbook = await getCurrentOrderbook();
    } catch (e) {
      console.log(e);
    }
    const DBUpdates = [];
    for (let i = 0; i < orderbook.length; i++) {
      const currencyPair = (Object.keys(orderbook[i])[0]);
      const currencyPairOHLCV = orderbook[i][currencyPair];
      const entry = {
        currencyPair,
        baseCurrency: currencyPair.split('_')[0],
        tradeCurrency: currencyPair.split('_')[1],
        date: (Math.floor(new Date() / 1000)),
        close: parseFloat(currencyPairOHLCV.last),
        volume: parseFloat(currencyPairOHLCV.baseVolume),
        quoteVolume: parseFloat(currencyPairOHLCV.quoteVolume)
      };
      DBUpdates.push(entry);
    }
    try {
      await DBPoloniex.insertMany(DBUpdates);
      console.log(`### ${new Date()} Updated ${DBUpdates.length} currencies in DB.`);
    } catch (e) {
      console.log('### ERROR: Couldn\'t save data.');
      console.log(e);
    }
  });
};
