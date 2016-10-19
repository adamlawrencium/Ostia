exports.output = function (Orderbook_All) {

  // Temporary variables for algorithm
  var highest_bid = 0;
  var lowest_ask = 10000000000;
  var low_amt;
  var key_ask = 'polo';
  var key_bid= 'polo';

  // Iterating through each exchange orderbook and creating updated info for each orderbook
  //   when update_curr_bid_ask is called, the current_bid_ask variable is updated
  //   with the most recent info from each exchanges Maps
  for (var key in Orderbook_All) {
    if (Orderbook_All.hasOwnProperty(key)) {
      Orderbook_All[key].update_curr_bid_ask();
    }
  }

  // Iterating through each exchange and finding the overall highest bid/lowest ask and
  //  the corresponding key
  for (var key in Orderbook_All) {
    if (Orderbook_All.hasOwnProperty(key)) {
      if (Orderbook_All[key].curr_bid_ask.highest_bid > highest_bid){
        highest_bid = Orderbook_All[key].curr_bid_ask.highest_bid;
        key_bid = key; // Saving the key of the highest bid
      }
      if (Orderbook_All[key].curr_bid_ask.lowest_ask < lowest_ask){
        lowest_ask = Orderbook_All[key].curr_bid_ask.lowest_ask;
        key_ask = key;
      }
    }
  }

  // Finding the volume available to be traded
  if (Orderbook_All[key_bid].curr_bid_ask.highest_bid_amt < Math.abs(Orderbook_All[key_ask].curr_bid_ask.lowest_ask_amt)) {
    low_amt = Orderbook_All[key_bid].curr_bid_ask.highest_bid_amt;
  }
  else {
    low_amt = Math.abs(Orderbook_All[key_ask].curr_bid_ask.lowest_ask_amt)
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

  for (var key in Orderbook_All) {
    if (Orderbook_All.hasOwnProperty(key)) {
      console.log(Orderbook_All[key].name + ":\t" + Orderbook_All[key].curr_bid_ask.highest_bid + ", " + Orderbook_All[key].curr_bid_ask.highest_bid_amt + "|\t|" + Orderbook_All[key].curr_bid_ask.lowest_ask + ", " + Orderbook_All[key].curr_bid_ask.lowest_ask_amt);
    }
  }
  console.log();
  console.log(profit + "," + Orderbook_All[key_bid].name + "," + Orderbook_All[key_ask].name + ",");
  console.log();
//}
}
