//================== POLONIEX DATA PARSING (MAP METHOD) ========================

exports.parse = function (args, highbid, lowask){


  // Initializing temporary variables for sorting through the maps
  var tmp_highbid = 0;
  var tmp_lowask = 1000000000000;
  var tmp_amt_highbid = 0;
  var tmp_amt_lowask = 0;

  for (var i=0;i<args.length;i++){
    if(args[i].type=="orderBookModify" && args[i].data.type == "bid") {
      highbid.set(args[i].data.rate, args[i].data.amount);
    }
    else if (args[i].type=="orderBookModify" && args[i].data.type == "ask") {
      lowask.set(args[i].data.rate, args[i].data.amount);
    }
    else if (args[i].type=="orderBookRemove" && args[i].data.type == "bid") {
      highbid.delete(args[i].data.rate);
    }
    else if (args[i].type=="orderBookRemove" && args[i].data.type == "ask") {
      lowask.delete(args[i].data.rate);
    }
  }

  // Sorting out the highest bid
  for (var [key, value] of highbid) {
    if (key>tmp_highbid){
      tmp_highbid = key;
      tmp_amt_highbid = value;
    }
  }

highbid.forEach(function(value,key){
  if (key>tmp_highbid){
    tmp_highbid = key;
    tmp_amt_highbid = value;
  }
}, highbid)


  // Sorting out the lowest ask
  for (var [key, value] of lowask) {
    if (key<tmp_lowask){
      tmp_lowask = key;
      tmp_amt_lowask = value;
    }
  }

  // Printing out the highest bid and lowest ask
  console.log("High Bid Poloniex : " + tmp_highbid + "BTC , Amount: " + tmp_amt_highbid + " ETH");
  console.log("Low Ask Poloniex : " + tmp_lowask + "BTC , Amount: " + tmp_amt_lowask + " ETH");
  console.log("\n");

}
