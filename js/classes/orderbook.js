// Default Constructor
function orderbook (name, highbid, lowask) {

  // Setting default values
  this.name = name
  this.highbid = highbid
  this.lowask = lowask
  this.info = {"highest_bid":0, "highest_bid_amt":0, "lowest_ask":0, "lowest_ask_amt":0}

}

// Sorting function
orderbook.prototype.sortMap = function() {

    var highbid = this.highbid;
    var lowask = this.lowask;

    // Initializing temporary variables for sorting through the maps
    var tmp_highbid = 0,
    tmp_lowask = 1000000000000000,
    tmp_amt_highbid = 0,
    tmp_amt_lowask = 0;

    // Sorting for key=rate based exchanges
    if (this.name == "Kraken" || this.name == "Poloniex"){

      // Sorting out the highest bid
      highbid.forEach(function(value,key) {
        if (key > tmp_highbid) {
          tmp_highbid = key;
          tmp_amt_highbid = value;
        }
      }, highbid)

      // Sorting out the lowest ask
      lowask.forEach(function(value,key) {
        if (key < tmp_lowask) {
          tmp_lowask = key;
          tmp_amt_lowask = value;
        }
      }, lowask)
    }

    // Sorting for key=order_id based exchanges
    else {

      // Sorting out the highest bid
      highbid.forEach(function(value,key) {
        if (value.rate > tmp_highbid) {
          tmp_highbid = value.rate;
          tmp_amt_highbid = parseFloat(value.amount);
        }
        else if (value.rate == tmp_highbid) {
          tmp_amt_highbid += parseFloat(value.amount);
        }
      }, highbid);

      // Sorting out the lowest ask
      lowask.forEach(function(value,key) {
        if (value.rate < tmp_lowask) {
          tmp_lowask = value.rate;
          tmp_amt_lowask = parseFloat(value.amount);
        }
        else if (value.rate == tmp_lowask) {
          tmp_amt_lowask += parseFloat(value.amount);
        }
      }, lowask)

    }

    // Returning summarized data
    var info = {"highest_bid":tmp_highbid, "highest_bid_amt":tmp_amt_highbid, "lowest_ask":tmp_lowask, "lowest_ask_amt":tmp_amt_lowask};
    this.info = info;
}

module.exports = orderbook;
