// Function to parse the underlying maps in each exchange
function mapParse(exchangeData, exchangeType) {
  var highbids = exchangeData.highbids;
  var lowasks = exchangeData.lowasks;

  // Initializing temporary variables for sorting through the maps
  var tmp_highbid = 0,
  tmp_lowask = 1000000000000000,
  tmp_amt_highbid = 0,
  tmp_amt_lowask = 0;

  // TODO parseFloat numbers when they are stored, not when now

  // Iterating through each entry in the map to find highest value
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

  // Iterating through each entry in the map to find smallest value
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

  // Return summarized results
  return [tmp_highbid, tmp_amt_highbid, tmp_lowask, tmp_amt_lowask];
}

module.exports = mapParse;
