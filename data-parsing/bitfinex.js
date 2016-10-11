exports.parse = function (data, highbid, lowask){




if(data[2] == 0 && data[3] == -1){
  lowask.delete(data[1]);
}
else if(data[2] == 0 && data[3] == 1){
  highbid.delete(data[1]);
}
else if(data[1] != "hb" && data[3] > 0){
  highbid.set(data[1], {rate:data[2], amount:data[3]});
}
else if(data[1] != "hb" && data[3] < 0){
  lowask.set(data[1], {rate:data[2], amount:data[3]});
}



}
