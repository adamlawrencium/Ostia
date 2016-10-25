function outputExchangeData(pair, time) {

  // Temporary variables for algorithm
  var highest_bid = 0;
  var highest_bid_amt = 0;
  var lowest_ask = 10000000000;
  var lowest_ask_amt = 0;
  var low_amt;
  var data = {};

  // Passing in subset constructor
  var subSet = require("./../classes/sub-set.js");

  // Creating a subset of data and opening feeds to that data
  var Exchanges = subSet("all", [pair]);
  Exchanges.open();

  // Code for parsing the maps in each exchange
  var mapParse = require("./../data-parsing/map-parsing.js");

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

    // Entering fees
    var fee = .9975;
    var fee2 = .9975;

    // Calculating Profit
    var sellProfit = (highest_bid*low_amt*fee);
    var buyLoss = ((lowest_ask*low_amt)/fee2);
    var totalProfit = (sellProfit - buyLoss);
    var volumeNeeded = ((parseFloat(highest_bid) + parseFloat(lowest_ask)) * low_amt);
    var percentProfit = (totalProfit/volumeNeeded)

    for (var key in data) {
      if (data.hasOwnProperty(key)){
        console.log(key + ":\t" + parseFloat(data[key][0]).toPrecision(4) + ", " + parseFloat(data[key][1]).toPrecision(4) + "\t|| " + parseFloat(data[key][2]).toPrecision(4) + ", " + parseFloat(data[key][3]).toPrecision(4));
      }
    }

    console.log();
    console.log("Profit: $" + totalProfit.toPrecision(4) + ", Investment: $" + volumeNeeded.toPrecision(4) + ", Percent Return: " + percentProfit.toPrecision(4) + "%");
    console.log();

  }, time);
}

// Export
module.exports = outputExchangeData;
