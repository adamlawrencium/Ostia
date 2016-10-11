exports.parse = function (data, highbid, lowask){



for (var i = 0;i<data[1].length;i++){

  if(data[1][i][2] < 0){
    lowask.set(data[1][i][0], {rate:data[1][i][1], amount:data[1][i][2] })
  }
  else if(data[1][i][2] > 0){
    highbid.set(data[1][i][0], {rate:data[1][i][1], amount:data[1][i][2]});
  }
}






}
