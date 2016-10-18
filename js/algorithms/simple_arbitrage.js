exports.output = function (ob_all) {

  // Temporary variables for algorithm
  var highest_bid = 0;
  var lowest_ask = 10000000000;
  var low_amt;
  var key_ask = 'polo';
  var key_bid= 'polo';

  // Iterating through each exchange orderbook and creating updated info
  for (var key in ob_all) {
    if (ob_all.hasOwnProperty(key)) {
      ob_all[key].sortMap();
    }
  }

  // Iterating through each exchange and finding the highest bid/ lowest ask and
  //  the corresponding key
  for (var key in ob_all) {
    if (ob_all.hasOwnProperty(key)) {
      if (ob_all[key].info.highest_bid > highest_bid){
        highest_bid = ob_all[key].info.highest_bid;
        key_bid = key;
      }
      if (ob_all[key].info.lowest_ask < lowest_ask){
        lowest_ask = ob_all[key].info.lowest_ask;
        key_ask = key;
      }
    }
  }

  // Finding the volume available to be traded
  if (ob_all[key_bid].info.highest_bid_amt < Math.abs(ob_all[key_ask].info.lowest_ask_amt)) {
    low_amt = ob_all[key_bid].info.highest_bid_amt;
  }
  else {
    low_amt = Math.abs(ob_all[key_ask].info.lowest_ask_amt)
  }

  // Entering fees
  var fee = .9975;
  var fee2 = .9975;


  // Calculating Profit
  var sell_profit = (highest_bid*low_amt*fee);
  var buy_loss = ((lowest_ask*low_amt)/fee2);
  var profit = (sell_profit-buy_loss);

 //if (profit>0){
  // Printing out exchange info and profit
/*
  for (var key in ob_all) {
    if (ob_all.hasOwnProperty(key)) {
      console.log(ob_all[key].name + ":\t" + ob_all[key].info.highest_bid + ", " + ob_all[key].info.highest_bid_amt + "|\t|" + ob_all[key].info.lowest_ask + ", " + ob_all[key].info.lowest_ask_amt);
    }
  }

*/
  //console.log();
  console.log(profit + "," + ob_all[key_bid].name + "," + ob_all[key_ask].name + ",");
  //console.log();
//}
}
