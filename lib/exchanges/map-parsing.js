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
  });

  // Return summarized results
  return {hb:tmp_highbid, hb_amt:tmp_amt_highbid, la:tmp_lowask, la_amt:tmp_amt_lowask};
}

module.exports = orderbookSpread;
