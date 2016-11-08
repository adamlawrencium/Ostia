/* This file will contain three functions

1. Order object that returns infomation and or data
2. Output function that returns logging infomation
3. Actual algorithm


*/

var order = function(data) {
  return {
    profit:         data.totalProfit.toPrecision(4),
    investment:     data.volumeNeeded.toPrecision(4),
    percentReturn:  data.percentProfit.toPrecision(4)
  }
}

/*
This function is used for debugging/informational purposes.
Input:  data object that contains information.
Prints: data in pretty format to console

TODO: Create a different object to export other performance data
*/
var outputPerformanceData = function(exdata,data) {
  // Printing out Exchange info and Profits
  for (var key in exdata) {
    if (data.hasOwnProperty(key)) {
      console.log(key + ":\t" + parseFloat(exdata[key][0]).toPrecision(4) + ", " +
                                parseFloat(exdata[key][1]).toPrecision(4) + "\t|| " +
                                parseFloat(exdata[key][2]).toPrecision(4) + ", " +
                                parseFloat(exdata[key][3]).toPrecision(4));
    }
  }

  console.log();
  console.log("Profit: $" +         data.totalProfit.toPrecision(4) +
            ", Investment: $" +     data.volumeNeeded.toPrecision(4) +
            ", Percent Return: " +  data.percentProfit.toPrecision(4) + "%");
  console.log();

}

function largestSpreadArbitrage(pair, time) {
  // Temporary variables for algorithm
  var highest_bid = 0;
  var highest_bid_amt = 0;
  var lowest_ask = Number.MAX_VALUE;
  var lowest_ask_amt = 0;
  var low_amt;
  var data = {};

  // Passing in subset constructor
  var DataHub = require("../DataHub.js");

  // Creating a subset of data and opening feeds to that data
  var Exchanges = DataHub("all", [pair]);
  Exchanges.open();

  // Code for parsing the maps in each exchange
  var mapParse = require("./../exchanges/map-parsing.js");

  // Calling the actual arbitrage logic in the time interval specified
  setInterval(function () {
    for (var key in Exchanges) {
      if (Exchanges.hasOwnProperty(key)) {
        for (var key_2 in Exchanges[key]){
          if (Exchanges[key].hasOwnProperty(key_2)) {
            data[key] = mapParse(Exchanges[key][key_2], key);
          }
        }
      }
    }
    // Finding the absolute highest bid and lowest ask
    for (var key in data) {
      if (data.hasOwnProperty(key)){
        if (data[key][0]>highest_bid) {
          highest_bid = data[key][0];
          highest_bid_amt = data[key][1];
        }
        if (data[key][2]<lowest_ask) {
          lowest_ask = data[key][2];
          lowest_ask_amt = data[key][3];
        }
      }
    }

    // Finding the volume available to be traded
    if (highest_bid_amt < Math.abs(lowest_ask_amt)) {
      low_amt = highest_bid_amt;
    }
    else {
      low_amt = Math.abs(lowest_ask_amt);
    }

    fee =    .9975;
    fee2 =   .9975;

    var pdata = new Object();
    pdata.sellProfit =     (highest_bid*low_amt*fee);
    pdata.buyLoss =        ((lowest_ask*low_amt)/fee2);
    pdata.totalProfit =     (pdata.sellProfit - pdata.buyLoss);
    pdata.volumeNeeded =   ((parseFloat(highest_bid) + parseFloat(lowest_ask)) * low_amt);
    pdata.percentProfit =  (pdata.totalProfit/pdata.volumeNeeded);
    // var performanceData = {
    //   // Entering fees
    //   fee =    .9975,
    //   fee2 =   .9975,
    //   // Calculating Profit
    //
    //   //calculate () {
    //     sellProfit =     (highest_bid*low_amt*this.fee),
    //     buyLoss =        ((lowest_ask*low_amt)/this.fee2),
    //     totalProfit =     (this.sellProfit - this.buyLoss),
    //     volumeNeeded =   ((parseFloat(highest_bid) + parseFloat(lowest_ask)) * low_amt),
    //     percentProfit =  (this.totalProfit/this.volumeNeeded)
    //   //}
    //
    // }

    outputPerformanceData(data,pdata);
    //var order = new Order(performanceData;)
    //return order;



  }, time);
}


// function outputExchangeData(pair, time) {
//
//   // Temporary variables for algorithm
//   var highest_bid = 0;
//   var highest_bid_amt = 0;
//   var lowest_ask = Number.MAX_VALUE;
//   var lowest_ask_amt = 0;
//   var low_amt;
//   var data = {};
//
//   // Passing in subset constructor
//   var DataHub = require("../DataHub.js");
//
//   // Creating a subset of data and opening feeds to that data
//   var Exchanges = DataHub("all", [pair]);
//   Exchanges.open();
//
//   // Code for parsing the maps in each exchange
//   var mapParse = require("./../exchanges/map-parsing.js");
//
//   // Calling the actual arbitrage logic in the time interval specified
//   setInterval(function () {
//     for (var key in Exchanges) {
//       if (Exchanges.hasOwnProperty(key)) {
//         for (var key_2 in Exchanges[key]){
//           if (Exchanges[key].hasOwnProperty(key_2)) {
//             data[key] = mapParse(Exchanges[key][key_2], key);
//           }
//         }
//       }
//     }
//     // Finding the absolute highest bid and lowest ask
//     for (var key in data) {
//       if (data.hasOwnProperty(key)){
//         if (data[key][0]>highest_bid) {
//           highest_bid = data[key][0];
//           highest_bid_amt = data[key][1];
//         }
//         if (data[key][2]<lowest_ask) {
//           lowest_ask = data[key][2];
//           lowest_ask_amt = data[key][3];
//         }
//       }
//     }
//
//     // Finding the volume available to be traded
//     if (highest_bid_amt < Math.abs(lowest_ask_amt)) {
//       low_amt = highest_bid_amt;
//     }
//     else {
//       low_amt = Math.abs(lowest_ask_amt);
//     }
//
//     // Entering fees
//     var fee = .9975;
//     var fee2 = .9975;
//
//     // Calculating Profit
//     var sellProfit = (highest_bid*low_amt*fee);
//     var buyLoss = ((lowest_ask*low_amt)/fee2);
//     var totalProfit = (sellProfit - buyLoss);
//     var volumeNeeded = ((parseFloat(highest_bid) + parseFloat(lowest_ask)) * low_amt);
//     var percentProfit = (totalProfit/volumeNeeded)
//
//
//     // Printing out Exchange info and Profits
//     for (var key in data) {
//       if (data.hasOwnProperty(key)) {
//         console.log(key + ":\t" + parseFloat(data[key][0]).toPrecision(4) + ", " + parseFloat(data[key][1]).toPrecision(4) + "\t|| " + parseFloat(data[key][2]).toPrecision(4) + ", " + parseFloat(data[key][3]).toPrecision(4));
//       }
//     }
//
//
//     console.log();
//     console.log("Profit: $" + totalProfit.toPrecision(4) + ", Investment: $" + volumeNeeded.toPrecision(4) + ", Percent Return: " + percentProfit.toPrecision(4) + "%");
//     console.log();
//
//
//
//
//
//   }, time);
// }




// Export
module.exports = {
  largestSpreadArbitrage,
  order
}
