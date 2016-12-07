/*
This is a basic strategy file with three main components:
  1. The actual algorithm (largestSpreadArbitrage) that finds the largest spread
  2. Output function (outputPerformanceData) that returns logging infomation
  3. Order object (order) that returns infomation and or data
      this will be used to send to server for trade orders

This fill will output two things:
  1. An order
  2. Fincial information that can be sent to the client for performance tracking

TODO: Format of generic strategy file needs to be discussed

*/

var order = function(data) {
  return {
    profit:         data.totalProfit.toPrecision(4),
    investment:     data.volumeNeeded.toPrecision(4),
    percentReturn:  data.percentProfit.toPrecision(4)
  }
}

/*
This function prints out info for general debugging/informational purposes.
Inputs: performance data: financial infomation that shows strategy performance
        exchange data:    additional information about exchanges

TODO: Create a different object to export other performance data (separate
          financial performance and exchange data)
*/
var outputPerformanceData = function(exchangeData,performanceData) {
  // Printing out Exchange info and Profits
  for (var exchange in exchangeData) {
    if (exchangeData.hasOwnProperty(exchange)) {
      console.log(exchange + ":\t" +  parseFloat(exchangeData[exchange].hb).toPrecision(4) + ", " +
                                      parseFloat(exchangeData[exchange].hb_amt).toPrecision(4) + "\t|| " +
                                      parseFloat(exchangeData[exchange].la).toPrecision(4) + ", " +
                                      parseFloat(exchangeData[exchange].la_amt).toPrecision(4));
    }
  }

  console.log();
  console.log("Profit: $" +         performanceData.totalProfit.toPrecision(4) +
            ", Investment: $" +     performanceData.volumeNeeded.toPrecision(4) +
            ", Percent Return: " +  performanceData.percentProfit.toPrecision(4) + "%");
  console.log();
}


/*
This function is the actual algorithm that finds the largest spread between
  different bids and asks for all exchanges provided.

TODO: using the time interval is funky... this needs to be standardized either
        in all strategy files or in TradingDesk
*/
function strategy(Exchanges, pair) {
  // Temporary variables for algorithm
  var highest_bid       = 0;
  var highest_bid_amt   = 0;
  var lowest_ask        = Number.MAX_VALUE;
  var lowest_ask_amt    = 0;
  var low_amt           = 0;
  var exchSumm             = {};
  var order = [{},{}]

  // Code for parsing the maps in each exchange
  var mapParse = require("./../exchanges/map-parsing.js");

  // Placing each summarized orderbook in the data structure exchSumm
    for (var exchange in Exchanges) {
      if (Exchanges.hasOwnProperty(exchange) && Exchanges[exchange][pair] != undefined) {
            //console.log(Exchanges)
            exchSumm[exchange] = mapParse(Exchanges[exchange][pair].orderbook);
        }
      }

      order[0].side = "sell";
      order[1].side = "buy";
    // Finding the absolute highest bid and lowest ask
    for (var exchange in exchSumm) {
      if (exchSumm.hasOwnProperty(exchange)) {
        if (exchSumm[exchange].hb > highest_bid) {
          highest_bid     = exchSumm[exchange].hb;
          highest_bid_amt = exchSumm[exchange].hb_amt;
          order[0].exchange = exchange;

        }
        if (exchSumm[exchange].la < lowest_ask) {
          lowest_ask      = exchSumm[exchange].la;
          lowest_ask_amt  = exchSumm[exchange].la_amt;
          order[1].exchange = exchange;
        }
      }
    }

    order[0].price = highest_bid;
    order[1].price = lowest_ask;

    order[0].pair = Exchanges[order[0].exchange][pair].pair;
    order[1].pair = Exchanges[order[1].exchange][pair].pair;

    // Finding the volume available to be traded
    if (highest_bid_amt < Math.abs(lowest_ask_amt)) {
      low_amt = highest_bid_amt;
    }
    else {
      low_amt = Math.abs(lowest_ask_amt);
    }

    order[0].amount = low_amt;
    order[1].amount = low_amt;

    var fee   = .9975;
    var fee2  = .9975;

    // TODO: Make this not ugly.
    var pdata = new Object();
    pdata.sellProfit      = (highest_bid*low_amt*fee);
    pdata.buyLoss         = ((lowest_ask*low_amt)/fee2);
    pdata.totalProfit     = (pdata.sellProfit - pdata.buyLoss);
    pdata.volumeNeeded    = ((parseFloat(highest_bid) + parseFloat(lowest_ask)) * low_amt);
    pdata.percentProfit   = (pdata.totalProfit/pdata.volumeNeeded);

    outputPerformanceData(exchSumm, pdata);
    if (pdata.totalProfit > 0){
      return (order);
    }
    return(null);

}

// Export
module.exports = {
  strategy,
  order
}
