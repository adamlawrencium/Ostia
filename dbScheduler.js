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
const GRANULARITY = 86400;

// makes bursts of 6 requests
function poloniexRequester(requests) {


}
// 300, 900, 1800, 7200, 14400, 86400
function getTickData(currencyA, currencyB) {
  return new Promise((resolve, reject) => {
    var tickData = [];
    polo.returnChartData(currencyA, currencyB, GRANULARITY, 1000000000, 9999999999, (err, data) => {
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


function checkAgeOfTickData(tickData) {
  for (var i = 0; i < tickData.length; i++) {
    if ((new Date().getTime()/1000) - tickData[i].date < GRANULARITY) {
      console.log(`### Data for ${tickData[i].currencyPair} is fresh!`);
      return (true);
    }
  }
}

function updateDoc(tickData, currencyA, currencyB) {
  return new Promise(async function(resolve, reject) {
    var mostRecent = 0;
    for (var i = 0; i < tickData.length; i++) {
      if (tickData[i].date > mostRecent) {
        mostRecent = tickData[i].date;
      }
    }
    var startTime = mostRecent + GRANULARITY;
    var newData = [];
    polo.returnChartData(currencyA, currencyB, GRANULARITY, startTime, 9999999999, (err, data) => {
      if (err) {
        console.log('### ERROR getting historical tick data for', (currencyA+'_'+currencyB));
        console.log(err);
      } else {
        for (var i = 0; i < data.length; i++) {
          newData.push(data[i]);
        }
      }
      var bulkWriteToDB = [];
      for (var i = 0; i < newData.length; i++) {
        const entry = {
          "currencyPair": (currencyA+'_'+currencyB),
          "baseCurrency": currencyA,
          "tradeCurrency": currencyB,
          "date": newData[i].date,
          "high": newData[i].high,
          "low": newData[i].low,
          "close": newData[i].close,
          "volume": newData[i].volume,
          "quoteVolume": newData[i].quoteVolume,
          "weightedAverage": newData[i].weightedAverage
        };
        bulkWriteToDB.push(entry);
      }
      try {
        console.log('### Updating entry to the DB...');
        var savedData = await (new DB_Poloniex.insertMany(bulkWriteToDB));
        console.log('### SUCCESS: Data for ' + pair + ' was updated to DB');
        resolve(('### SUCCESS: Data for ' + pair + ' was updated to DB'));
      } catch (e) {
        console.log('### ERROR: Couldn\'t update data.');
        console.log(e);
        reject(e)
      }
    });
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
        var AB = pair.split('_'); var A = AB[0]; var B = AB[1];
        var tickDataFromDB = await DB_Poloniex.find({
          currencyPair: pair
        });

        if (tickDataFromDB.length > 5) {
          console.log(`### ${pair} found in DB.`);
          if (checkAgeOfTickData(tickDataFromDB) == true) {
            console.log(`### Data for ${pair} is up to date.`);
          } else {
            console.log(`### Data for ${pair} is not up to date. Updating...`);
            await updateDoc(tickDataFromDB, A, B);
          }
        }
        else {
          console.log('### New pair found:', pair);
          DBUpdatePromises.push(addPairToDB_Poloniex(pair, A, B));
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
  });
}


exports.dbUpdater = function() {
  // Job runs at the top of every 5 minutes
  var j = schedule.scheduleJob('*/5 * * * *', function() {
    console.log(new Date(), 'DATABASE UPDATED');
    console.log();
  });
}
