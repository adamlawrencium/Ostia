/*
Go through every currency pair in the DB.
  If any is over 5 mins old, query and add to DB
Find poloniexdata
find all documents
  for each document (currency pair)
    if last elements 'date' is more than five minutes old
      add currencies to list

DBPoloniex.deleteMany({}).then( (data) => {
  console.log(data);
});
 */


/*
 * Here we get all USDT currencies and add them to our database
 */


const schedule = require('node-schedule');
const Poloniex = require('poloniex.js');
const DBPoloniex = require('./models/PoloniexData');
// const exchangeData = require('./controllers/exchangeData');

const polo = new Poloniex();
const GRANULARITY = 300;

// 300, 900, 1800, 7200, 14400, 86400
function getTickData(currencyA, currencyB) {
  return new Promise((resolve, reject) => {
    const tickData = [];
    polo.returnChartData(currencyA, currencyB, GRANULARITY, 1503014400, 9999999999, (err, data) => {
      if (err) {
        console.log('### ERROR getting historical tick data for', (`${currencyA}_${currencyB}`));
        console.log(err);
        // throw new Error('data request messed up...')
        reject(err);
      } else {
        for (let i = 0; i < data.length; i++) {
          tickData.push(data[i]);
        }
        resolve(tickData);
      }
      reject(err);
    });
  });
}

function addNewPairToDBPoloniex(pair, currencyA, currencyB) {
  return new Promise(async (resolve, reject) => {
    console.log('### Getting tick data for', pair, '...');
    let tickData;
    try {
      tickData = await getTickData(currencyA, currencyB);
    } catch (e) {
      console.log(e);
      reject('### ERROR GETTING POLONIEX DATA FOR', pair);
      return;
    }

    console.log('### Recieved data for', pair, `[${tickData.length - 1}] points`);
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
      console.log('### Adding entry to the DB...');
      await new DBPoloniex().insertMany(bulkWriteToDB);
      console.log(`### SUCCESS: Data for ${pair} was saved to DB`);
      resolve((`### SUCCESS: Data for ${pair} was saved to DB`));
    } catch (e) {
      console.log('### ERROR: Couldn\'t save data.');
      console.log(e);
      reject(e);
    }
  });
}

function getCurrentOrderbook() {
  return new Promise((resolve, reject) => {
    polo.getTicker((err, data) => {
      if (err) {
        reject(err);
        return;
      }
      const ret = [];
      Object.keys(data).forEach((key) => {
        ret.push({ key: data[key] });
      });
      resolve(ret);
    });
  });
}


function checkAgeOfTickData(tickData) {
  let i;
  for (i = 0; i < tickData.length; i++) {
    if ((new Date().getTime() / 1000) - tickData[i].date < GRANULARITY) {
      console.log('data is freshhh');
      return true;
    }
  }
  return false;
}

function updateDoc(tickData, currencyA, currencyB) {
  return new Promise(async (resolve, reject) => {
    let mostRecent = 0;
    for (let i = 0; i < tickData.length; i++) {
      if (tickData[i].date > mostRecent) {
        mostRecent = tickData[i].date;
      }
    }
    const startTime = mostRecent + GRANULARITY;
    const newData = [];
    polo.returnChartData(currencyA, currencyB, GRANULARITY, startTime, 9999999999, async (err, data) => {
      if (err) {
        console.log('### ERROR getting historical tick data for', (`${currencyA}_${currencyB}`));
        console.log(err);
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
        await (new DBPoloniex().insertMany(bulkWriteToDB));
        console.log(`### SUCCESS: Data for ${currencyA}_${currencyB} was updated to DB`);
        resolve((`### SUCCESS: Data for ${currencyA}_${currencyB} was updated to DB`));
      } catch (e) {
        console.log('### ERROR: Couldn\'t update data.');
        console.log(e);
        reject(e);
      }
    });
  });
}

exports.dbInitializer = async function () {
  // take an orderbook snapshot
  // for pairs in snapshot but not in database, add it (this will add new currencies)
  //
  return new Promise(async (resolve, reject) => {
    if (0) {
      console.log('Clearing out database...');
      DBPoloniex.deleteMany({}).then((data) => { console.log(data); resolve(); });
    } else {
      let orderbook;
      try {
        console.log('### Getting orderbooks and current DB docs');
        orderbook = await Promise.all(getCurrentOrderbook());
        console.log('### Recieved orderbooks.', orderbook);
      } catch (e) {
        console.log(e);
        reject(e);
      }
      const DBAddNewEntryPromises = [];
      for (let i = 0; i < orderbook.length; i++) {
        const pair = orderbook[i];
        console.log(pair);
        const AB = pair.split('_'); const A = AB[0]; const B = AB[1];
        DBPoloniex.find({ currencyPair: pair }).sort({ date: -1 }).limit(1).then((tickDataFromDB) => {
          if (tickDataFromDB.length !== 0) {
            console.log(`### ${pair} found in DB.`);
            if (checkAgeOfTickData(tickDataFromDB) === true) {
              console.log(`### ${pair} data is up to date.`);
            } else {
              console.log(`### ${pair} data is not up to date. Updating...`);
              // await updateDoc(tickDataFromDB, A, B);
            }
          }
        })
        .catch((err) => {
          console.log('### New pair found:', pair);
          DBAddNewEntryPromises.push(addNewPairToDBPoloniex(pair, A, B));
          console.log(err);
        });
        // console.log(tickDataFromDB);
        // console.log('### Querying most recent tick for',pair);
        // DBUpdateEntryPromises.push(tickDataFromDB);
      }

      let DBUpdateResolves;
      try {
        // console.log((await Promise.all(DBUpdateEntryPromises)));
        // DBUpdateResolves = await Promise.all(DBAddNewEntryPromises);
        resolve(DBUpdateResolves);
      } catch (e) {
        console.log(e);
        reject(DBUpdateResolves);
      }
    }
  });
};


exports.dbUpdater = function () {
  // Job runs at the top of every 5 minutes
  schedule.scheduleJob('*/1 * * * *', () => {
    console.log();
    getCurrentOrderbook().then((orderbook) => {
      console.log(orderbook);
      console.log(new Date(), 'DATABASE UPDATED');
    });
    // get orderbook
    // for each currency in book, create new entry with updated price

    console.log();
  });
};
