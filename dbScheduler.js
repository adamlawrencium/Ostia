/*
Go through every currency pair in the DB.
  If any is over 5 mins old, query and add to DB
Find poloniexdata
find all documents
  for each document (currency pair)
    if last elements 'date' is more than five minutes old
      add currencies to list

DB_Poloniex.deleteMany({}).then( (data) => {
  console.log(data);
});
 */


/*
 * Here we get all USDT currencies and add them to our database
 */

const mongoose = require('mongoose');
const schedule = require('node-schedule');
const poloniex = require('poloniex.js');
const DB_Poloniex = require('./models/PoloniexData');
// const exchangeData = require('./controllers/exchangeData');

const polo = new poloniex();

function getTickData(currencyA, currencyB) {
  return new Promise((resolve, reject) => {
    var tickData = [];
    polo.returnChartData(currencyA, currencyB, 86400, 1000000000, 9999999999, (err, data) => {
      if (err) {
        throw new Error('data request messed up...')
      } else {
        for (var i = 0; i < data.length; i++) {
          tickData.push(data[i]);
        }
        resolve(tickData);
      }
      reject('Something happened, oh no!');
    });
  });
}

function addPairToDB_Poloniex(pair, currencyA, currencyB) {
  return new Promise(async function(resolve, reject) {
    console.log('### Getting tick data for', pair,'...');
    try {
      var tickData = await getTickData(currencyA, currencyB);
    } catch (e) {
      console.log(e);
      reject('### ERROR GETTING POLONIEX DATA FOR', pair)
    }

    const entry = {
      "currencyPair": pair,
      "baseCurrency": currencyA,
      "tradeCurrency": currencyB,
      "tickData": tickData
    };
    console.log('### Recieved data for', pair, tickData[0]);
    console.log('### Adding', pair, 'tick data to DB...');
    try {
      var savedData = await (new DB_Poloniex(entry)).save();
    } catch (e) {
      console.log('### ERROR: Couldn\'t save data.');
      reject(e)
    }
    resolve('### Data for',pair,'was saved to DB');
  });
}

function getCurrentOrderbook() {
  return new Promise(function(resolve, reject) {
    polo.getTicker( (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data)
    });
  });
}


exports.dbInitializer = async function() {
  // take an orderbook snapshot
  // for pairs in snapshot but not in database, add it (this will add new currencies)
  //
  return new Promise(function(resolve, reject) {

    DB_Poloniex.deleteMany({}).then( data => { console.log(data); resolve();});

    // const [orderbook, docs] = await Promise.all([getCurrentOrderbook(), DB_Poloniex.find({})]);
    //
    // // console.log("docs", docs);
    // // console.log("orderbook", orderbook);
    //
    // var DBUpdatePromises = []
    // var toAdd = []
    // var updates = {}
    // for (pair in orderbook) {
    //   let foundPairInDB = false
    //   for (let i = 0; i < docs.length; i++) {
    //     if (pair == docs[i].currencyPair) {
    //       foundPairInDB = true;
    //     }
    //   }
    //   if (foundPairInDB) {
    //     console.log('###',pair,'already exists in DB. Updating entry...');
    //     // update DB entry
    //     // find db entry
    //     //  check current date - tickData[-1].date < 5 mins
    //     //  if yes, get data from tickData[-1].date to current time and add to DB
    //     //  if no, do nothing
    //   }
    //   else {
    //     console.log('### New pair found:', pair);
    //     var AB = pair.split('_'); var A = AB[0]; var B = AB[1];
    //     DBUpdatePromises.push(addPairToDB_Poloniex(pair, A, B));
    //     // process.exit(1)
    //   }
    // }
    //
    // const DBUpdateResolves = await Promise.all(DBUpdatePromises);
    // console.log(DBUpdatePromises);
    //

  })
}


exports.dbUpdater = function() {
  // Job runs at the top of every 5 minutes
  var j = schedule.scheduleJob('*/5 * * * *', function() {
    console.log(new Date(), 'DATABASE UPDATED');
    console.log();
  });
}
