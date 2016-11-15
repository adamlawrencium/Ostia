// Function to parse the underlying maps in each exchange
function orderbookSpread(orderbook) {

  // Initializing temporary variables for sorting through the orderbooks
  var tmp_highbid = 0,
  tmp_lowask = Number.MAX_SAFE_INTEGER,
  tmp_amt_highbid = 0,
  tmp_amt_lowask = 0;

  var tmp_highbid2 = 0,
  tmp_lowask2 = Number.MAX_SAFE_INTEGER,
  tmp_amt_highbid2 = 0,
  tmp_amt_lowask2 = 0;

  //console.log(orderbook);

  Object.keys(orderbook).forEach(function(key){
    if (orderbook[key] < 0 && key < tmp_lowask){
      tmp_lowask2 = tmp_lowask;
      tmp_amt_lowask2 = tmp_amt_lowask;

      tmp_lowask = key;
      tmp_amt_lowask = -1 * orderbook[key];
    }
    else if (orderbook[key] > 0 && key > tmp_highbid){
      tmp_highbid2 = tmp_highbid;
      tmp_amt_highbid2 = tmp_amt_highbid;

      tmp_highbid = key;
      tmp_amt_highbid = orderbook[key];
    }
    else if (orderbook[key] < 0 && key < tmp_lowask2){

      tmp_lowask2 = key;
      tmp_amt_lowask2 = -1 * orderbook[key];
    }
    else if (orderbook[key] > 0 && key > tmp_highbid2){

      tmp_highbid2 = key;
      tmp_amt_highbid2 = orderbook[key];
    }
  });

/*
  // Iterating through each entry in the map to find highest value
  highbids.forEach(function(value, key) {
    // GDAX or Bit
    if (exchangeType === "gdax" || exchangeType === "bitfinex") {
      if (value.rate > tmp_highbid) {
        tmp_highbid = value.rate;
        tmp_amt_highbid = value.amount;
      }
      else if (value.rate == tmp_highbid) {
        tmp_amt_highbid += value.amount;
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
        tmp_amt_lowask = value.amount;
      }
      else if (value.rate == tmp_lowask) {
        tmp_amt_lowask += value.amount;
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
*/
  // Return summarized results
  return [[tmp_highbid, tmp_amt_highbid, tmp_lowask, tmp_amt_lowask],[tmp_highbid2, tmp_amt_highbid2, tmp_lowask2, tmp_amt_lowask2]];
}

module.exports = orderbookSpread;
