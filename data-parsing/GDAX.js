
exports.parse = function (data, highbid_GDAX, lowask_GDAX){

// Temporary variables
var tmp_GDAX_highbid,
    tmp_GDAX_lowask,
    tmp_GDAX_amt_highbid,
    tmp_GDAX_amt_lowask;

var data2 = JSON.parse(data)
if(data2.type == "open" && data2.side == "buy"){
  highbid_GDAX.put(data2.order_id, {rate:data2.price, amount:data2.remaining_size});
}
else if(data2.type == "done" && data2.side == "buy"){
  highbid_GDAX.delete(data2.order_id);
}
else if(data2.type == "change" && data2.side == "buy"){
  highbid_GDAX.put(data2.order_id, {rate:data2.price, amount:data2.new_size});
}
else if(data2.type == "open" && data2.side == "sell"){
  lowask_GDAX.put(data2.order_id, {rate:data2.price, amount:data2.remaining_size});
}
else if(data2.type == "done" && data2.side == "sell"){
  lowask_GDAX.delete(data2.order_id);
}
else if(data2.type == "change" && data2.side == "sell"){
  lowask_GDAX.put(data2.order_id, {rate:data2.price, amount:data2.new_size});
}

// Using SkipList sorting method to gather the highest orders
var highbid_sort = highbid.entrySet();
tmp_highbid = highbid_sort[highbid_sort.length-1].key;
tmp_amt_highbid = highbid_sort[0].value;

var lowask_sort = lowask.entrySet();
tmp_lowask = lowask_sort[0].key;
tmp_amt_lowask = lowask_sort[0].value;


// Printing out the highest bid and lowest ask
console.log("High Bid GDAX: " + tmp_GDAX_highbid + "BTC , Amount: " + tmp_GDAX_amt_highbid + " ETH");
console.log("Low Ask GDAX: " + tmp_GDAX_lowask + "BTC , Amount: " + tmp_GDAX_amt_lowask + " ETH");
console.log("\n");

}
