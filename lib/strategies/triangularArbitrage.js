var Poloniex = require('../exchanges/poloniexAPI.js');
var async = require('async');

// Create a new instance
poloniex = new Poloniex();

//
// var count = 0;
// var eventLoop = function(num) {
//   if (count > num) {
//     return;
//   }
//   poloniex.getTicker(function(err, data) {
//     console.log(data);
//     count++;
//     eventLoop();
//   });
// }
//
//
//
// eventLoop(5)
/*
poloniex.getTicker(function(err, data) {
count++;
console.log(data);
setTimeout(function() {
callback(null, count);
}, 1000/5000);
})
*/

var count = 0;
async.whilst(
  function() { return count < 5; },   // this will be replaced with a timer
  function(callback) {
    count++;
    console.log('hi');
    poloniex.getTicker(function(err, data) {
      console.log("RETURN VALUE");
    });
    setTimeout(function() {
      callback(null, count);
    }, 1000/10);
  },
  function (err, n) {
    console.log("FINISHED");
  }
);
