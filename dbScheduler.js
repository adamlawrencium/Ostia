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

'use strict';

const sleep = require('sleep');
const mongoose = require('mongoose');
const schedule = require('node-schedule');
const poloniex = require('poloniex.js');
const DB_Poloniex = require('./models/PoloniexData');
// const exchangeData = require('./controllers/exchangeData');

const polo = new poloniex();

// makes bursts of 6 requests
function poloniexRequester(requests) {


}
// 300, 900, 1800, 7200, 14400, 86400
function getTickData(currencyA, currencyB) {
  return new Promise((resolve, reject) => {
    var tickData = [];
    polo.returnChartData(currencyA, currencyB, 86400, 1000000000, 9999999999, (err, data) => {
      if (err) {
        console.log('### ERROR getting historical tick data for', (currencyA+'_'+currencyB));
        console.log(err);
        // throw new Error('data request messed up...')
        reject(err);
      } else {
        for (var i = 0; i < data.length; i++) {
          tickData.push(data[i]);
        }
        resolve(tickData);
      }
      reject(err);
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
      return;
    }

    console.log('### Recieved data for', pair, `[${tickData.length-1}] points`);
    var bulkWriteToDB = [];
    for (var i = 0; i < tickData.length; i++) {
      const entry = {
        "currencyPair": pair,
        "baseCurrency": currencyA,
        "tradeCurrency": currencyB,
        "date": tickData[i].date,
        "high": tickData[i].high,
        "low": tickData[i].low,
        "close": tickData[i].close,
        "volume": tickData[i].volume,
        "quoteVolume": tickData[i].quoteVolume,
        "weightedAverage": tickData[i].weightedAverage
      };
      bulkWriteToDB.push(entry);
    }
    try {
      console.log('### Adding entry to the DB...');
      var savedData = await new DB_Poloniex.insertMany(bulkWriteToDB);
      console.log('### SUCCESS: Data for ' + pair + ' was saved to DB');
      resolve(('### SUCCESS: Data for ' + pair + ' was saved to DB'));
    } catch (e) {
      console.log('### ERROR: Couldn\'t save data.');
      console.log(e);
      reject(e)
    }
  });
}

function getCurrentOrderbook() {
  return new Promise(function(resolve, reject) {
    polo.getTicker( (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data)
    });
  });
}

function checkAgeOfPair(currencyPair) {
  return new Promise(async function(resolve, reject) {
    console.log('### finding age of', currencyPair,'...');
    var tickData = await DB_Poloniex.find({
      currencyPair: currencyPair
    });
    for (var i = 0; i < tickData.length; i++) {
      if ((new Date().getTime()/1000) - tickData[i].date < 86400) {
        console.log(`Data for ${currencyPair} is fresh!`);
        resolve('Data is fresh!');
      }
    }
  });
}

exports.dbInitializer = async function() {
  // take an orderbook snapshot
  // for pairs in snapshot but not in database, add it (this will add new currencies)
  //
  return new Promise(async function(resolve, reject) {
    if (0) {
      console.log('Clearing out database...');
      DB_Poloniex.deleteMany({}).then( data => { console.log(data); resolve();});
    } else {
      var orderbook; var docs;
      try {
        console.log('### Getting orderbooks and current DB docs');
        [orderbook, docs] = await Promise.all([getCurrentOrderbook() /*DB_Poloniex.find({})*/]);
        console.log('### Recieved orderbooks.');
      } catch (e) {
        console.log(e);
        reject(e);
      }
      var DBUpdatePromises = [];
      var toAdd = [];
      var updates = {};
      for (var pair in orderbook) {
        let foundPairInDB = false;
        console.log(await checkAgeOfPair(pair));
        if (foundPairInDB) {
          console.log('###', pair, 'already exists in DB.');
          // update DB entry
          // find db entry
          //  check current date - tickData[-1].date < 5 mins
          //  if yes, get data from tickData[-1].date to current time and add to DB
          //  if no, do nothing
        }
        else {
          console.log('### New pair found:', pair);
          var AB = pair.split('_'); var A = AB[0]; var B = AB[1];
          // setTimeout(function () {
          // sleep.msleep(1000);
          DBUpdatePromises.push(addPairToDB_Poloniex(pair, A, B));
          // }, 0);
        }
      }

      let DBUpdateResolves;
      try {
        DBUpdateResolves = await Promise.all(DBUpdatePromises);
        resolve(DBUpdateResolves)
      } catch (e) {
        console.log(e);
        reject(DBUpdateResolves)
      }
    }
    // resolve();
    // DB_Poloniex.find({}).then(data => {console.log(data);})

  });
}


exports.dbUpdater = function() {
  // Job runs at the top of every 5 minutes
  var j = schedule.scheduleJob('*/5 * * * *', function() {
    console.log(new Date(), 'DATABASE UPDATED');
    console.log();
  });
}
