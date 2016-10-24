function outputExchangeData(allExchangeData) {

  // Temporary variables for algorithm
  var highest_bid = 0;
  var highest_bid_amt = 0;
  var lowest_ask = 10000000000;
  var lowest_ask_amt = 0;
  var low_amt;

  // Code for parsing the maps in each exchange
  var mapParse = require("./../data-parsing/map-parsing.js");

  // Condensing maps into the highest bid and lowest ask
  var Krak_Info = mapParse(allExchangeData.kraken, "kraken");
  var Polo_Info = mapParse(allExchangeData.poloniex, "poloniex");
  var GDAX_Info = mapParse(allExchangeData.gdax, "gdax");
  var Bitf_Info = mapParse(allExchangeData.bitfinex, "bitfinex");

  // Creating a overall array to store highest bids and lowest asks
  var overall = [Polo_Info, GDAX_Info, Bitf_Info, Krak_Info];

  // Finding the absolute highest bid and lowest ask
  for (var i=0; i<overall.length; i++) {
    if (overall[i][0]>highest_bid) {
      highest_bid = overall[i][0];
      highest_bid_amt = overall[i][1];
    }
    if (overall[i][2]<lowest_ask) {
      lowest_ask = overall[i][2];
      lowest_ask_amt = overall[i][3];
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

  // Printing out useful info
  console.log("Polo:\t" + parseFloat(Polo_Info[0]).toPrecision(4) + ", " + parseFloat(Polo_Info[1]).toPrecision(4) + "\t|| " + parseFloat(Polo_Info[2]).toPrecision(4) + ", " + parseFloat(Polo_Info[3]).toPrecision(4));
  console.log("GDAX:\t" + parseFloat(GDAX_Info[0]).toPrecision(4) + ", " + parseFloat(GDAX_Info[1]).toPrecision(4) + "\t|| " + parseFloat(GDAX_Info[2]).toPrecision(4) + ", " + parseFloat(GDAX_Info[3]).toPrecision(4));
  console.log("Bitf:\t" + parseFloat(Bitf_Info[0]).toPrecision(4) + ", " + parseFloat(Bitf_Info[1]).toPrecision(4) + "\t|| " + parseFloat(Bitf_Info[2]).toPrecision(4) + ", " + parseFloat(Bitf_Info[3]).toPrecision(4));
  console.log("Krak:\t" + parseFloat(Krak_Info[0]).toPrecision(4) + ", " + parseFloat(Krak_Info[1]).toPrecision(4) + "\t|| " + parseFloat(Krak_Info[2]).toPrecision(4) + ", " + parseFloat(Krak_Info[3]).toPrecision(4));
  console.log();
  console.log("Profit: $" + totalProfit.toPrecision(4) + ", Investment: $" + volumeNeeded.toPrecision(4) + ", Percent Return: " + percentProfit.toPrecision(4) + "%");
  console.log();
}

// Export
module.exports = outputExchangeData;
