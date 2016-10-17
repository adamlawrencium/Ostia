function parse(data, highbid_GDAX, lowask_GDAX){
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
}

module.exports = parse;
