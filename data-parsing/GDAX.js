
exports.parse = function (data, highbid_GDAX, lowask_GDAX){

var tmp_GDAX_highbid = 0;
var tmp_GDAX_lowask = 1000000000000000;
var tmp_GDAX_amt_highbid = 0;
var tmp_GDAX_amt_lowask = 0;


var data2 = JSON.parse(data)
if(data2.type == "open" && data2.side == "buy"){
  highbid_GDAX.set(data2.order_id, {rate:data2.price, amount:data2.remaining_size});
}
else if(data2.type == "done" && data2.side == "buy"){
  highbid_GDAX.delete(data2.order_id);
}
else if(data2.type == "change" && data2.side == "buy"){
  highbid_GDAX(data2.order_id).rate = data2.price;
  highbid_GDAX(data2.order_id).amount = data2.new_size;
}
else if(data2.type == "open" && data2.side == "sell"){
  lowask_GDAX.set(data2.order_id, {rate:data2.price, amount:data2.remaining_size});
}
else if(data2.type == "done" && data2.side == "sell"){
  lowask_GDAX.delete(data2.order_id);
}
else if(data2.type == "change" && data2.side == "sell"){
  lowask_GDAX(data2.order_id).rate = data2.price;
  lowask_GDAX(data2.order_id).amount = data2.new_size;
}

// Sorting out the highest bid
for (var [key, value] of highbid_GDAX) {
  if (value.rate > tmp_GDAX_highbid){
    tmp_GDAX_highbid = value.rate;
    tmp_GDAX_amt_highbid = parseFloat(value.amount);
  }
  else if (value.rate == tmp_GDAX_highbid){
    tmp_GDAX_amt_highbid += parseFloat(value.amount);
  }
}

// Sorting out the lowest ask
for (var [key, value] of lowask_GDAX) {
  if (value.rate < tmp_GDAX_lowask){
    tmp_GDAX_lowask = value.rate;
    tmp_GDAX_amt_lowask = parseFloat(value.amount);
  }
  else if (value.rate == tmp_GDAX_lowask){
    tmp_GDAX_amt_highbid += parseFloat(value.amount);
  }
}

// Printing out the highest bid and lowest ask
console.log("High Bid GDAX: " + tmp_GDAX_highbid + "BTC , Amount: " + tmp_GDAX_amt_highbid + " ETH");
console.log("Low Ask GDAX: " + tmp_GDAX_lowask + "BTC , Amount: " + tmp_GDAX_amt_lowask + " ETH");
console.log("\n");

}
