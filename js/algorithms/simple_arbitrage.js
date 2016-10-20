function outputExchangeData(allExchangeData) {
  // Temporary variables for algorithm
  var highest_bid = 0;
  var highest_bid_amt = 0;
  var lowest_ask = 10000000000;
  var lowest_ask_amt = 0;
  var low_amt;

  // Condensing maps into the highest bid and lowest ask
  var Krak_Info = large(allExchangeData.kraken, "kraken");
  var Polo_Info = large(allExchangeData.poloniex, "poloniex");
  var GDAX_Info = large(allExchangeData.gdax, "gdax");
  var Bitf_Info = large(allExchangeData.bitfinex, "bitfinex");

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
  var sell_profit = (highest_bid*low_amt*fee);
  var buy_loss = ((lowest_ask*low_amt)/fee2);
  // TODO: Why is this named "lel"? Rename to something more easily understood.
  var lel = (sell_profit-buy_loss);

  //if (lel > 0) {
  console.log("Polo:\t" + Polo_Info[0] + ", " + Polo_Info[1] + "\t|\t" + Polo_Info[2] + ", " + Polo_Info[3]);
  console.log("GDAX:\t" + GDAX_Info[0] + ", " + GDAX_Info[1] + "\t|\t" + GDAX_Info[2] + ", " + GDAX_Info[3]);
  console.log("Bitf:\t" + Bitf_Info[0] + ", " + Bitf_Info[1] + "\t|\t" + Bitf_Info[2] + ", " + Bitf_Info[3]);
  console.log("Krak:\t" + Krak_Info[0] + ", " + Krak_Info[1] + "\t|\t" + Krak_Info[2] + ", " + Krak_Info[3]);
  console.log();
  console.log(lel);
  console.log();
  //}
}

// TODO: Describe what function does and name it better
function large(exchangeData, exchangeType) {
  var highbids = exchangeData.highbids;
  var lowasks = exchangeData.lowasks;

  // Initializing temporary variables for sorting through the maps
  var tmp_highbid = 0,
  tmp_lowask = 1000000000000000,
  tmp_amt_highbid = 0,
  tmp_amt_lowask = 0;

  // Sorting out the highest bid
  highbids.forEach(function(value, key) {
    // GDAX or Bit
    if (exchangeType === "gdax" || exchangeType === "bitfinex") {
      if (value.rate > tmp_highbid) {
        tmp_highbid = value.rate;
        tmp_amt_highbid = parseFloat(value.amount);
      }
      else if (value.rate == tmp_highbid) {
        tmp_amt_highbid += parseFloat(value.amount);
      }
    }
    // Kraken or Polo
    else if (exchangeType === "kraken" || exchangeType === "poloniex") {
      if (key > tmp_highbid) {
        tmp_highbid = key;
        tmp_amt_highbid = value;
      }
    }
  })

  // Sorting out the lowest ask
  lowasks.forEach(function(value, key) {
    // GDAX or Bit
    if (exchangeType === "gdax" || exchangeType === "bitfinex") {
      if (value.rate < tmp_lowask) {
        tmp_lowask = value.rate;
        tmp_amt_lowask = parseFloat(value.amount);
      }
      else if (value.rate == tmp_lowask) {
        tmp_amt_lowask += parseFloat(value.amount);
      }
    }
    // Kraken or Polo
    else if (exchangeType === "kraken" || exchangeType === "poloniex") {
      if (key < tmp_lowask) {
        tmp_lowask = key;
        tmp_amt_lowask = value;
      }
    }
  })

  return [tmp_highbid, tmp_amt_highbid, tmp_lowask, tmp_amt_lowask];
}

// Export
module.exports = outputExchangeData;
