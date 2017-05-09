// Function to parse the underlying maps in each exchange
function orderbookSpread(orderbook) {

  // Initializing temporary variables for sorting through the orderbooks
  var tmp_highbid = 0,
  tmp_lowask = Number.MAX_SAFE_INTEGER,
  tmp_amt_highbid = 0,
  tmp_amt_lowask = 0;

  Object.keys(orderbook).forEach(function(key){
    if (orderbook[key] < 0 && key < tmp_lowask){
      tmp_lowask = key;
      tmp_amt_lowask = -1 * orderbook[key];
    }
    else if (orderbook[key] > 0 && key > tmp_highbid){
      tmp_highbid = key;
      tmp_amt_highbid = orderbook[key];

    }
  });

  // Return summarized results
  return {highbid:tmp_highbid, highbid_amt:tmp_amt_highbid, lowask:tmp_lowask, lowask_amt:tmp_amt_lowask};
}

module.exports = orderbookSpread;
