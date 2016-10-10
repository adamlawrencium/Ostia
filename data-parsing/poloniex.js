//================== POLONIEX DATA PARSING (MAP METHOD) ========================

exports.parse = function (args, highbid, lowask){

  // Initializing temporary variables for sorting through the maps
  var tmp_highbid,
      tmp_lowask,
      tmp_amt_highbid,
      tmp_amt_lowask;

  for (var i=0;i<args.length;i++){
    if(args[i].type=="orderBookModify" && args[i].data.type == "bid") {
      highbid.put(args[i].data.rate, args[i].data.amount);
    }
    else if (args[i].type=="orderBookModify" && args[i].data.type == "ask") {
      lowask.put(args[i].data.rate, args[i].data.amount);
    }
    else if (args[i].type=="orderBookRemove" && args[i].data.type == "bid") {
      highbid.delete(args[i].data.rate);
    }
    else if (args[i].type=="orderBookRemove" && args[i].data.type == "ask") {
      lowask.delete(args[i].data.rate);
    }
  }

// Using SkipList sorting method to gather the highest orders
var highbid_sort = highbid.entrySet();
tmp_highbid = highbid_sort[highbid_sort.length-1].key;
tmp_amt_highbid = highbid_sort[0].value;

var lowask_sort = lowask.entrySet();
tmp_lowask = lowask_sort[0].key;
tmp_amt_lowask = lowask_sort[0].value;

/*
  // Printing out the highest bid and lowest ask
  console.log("High Bid Poloniex : " + tmp_highbid + "BTC , Amount: " + tmp_amt_highbid + " ETH");
  console.log("Low Ask Poloniex : " + tmp_lowask + "BTC , Amount: " + tmp_amt_lowask + " ETH");
  console.log("\n");
*/
}
