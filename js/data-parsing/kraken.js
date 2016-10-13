exports.parse = function (data, highbid, lowask){
  //var bids = data.result.XETHXXBT.bids;
  //var asks = data.result.XETHXXBT.asks;
  var bids = data.result.XXBTZUSD.bids;
  var asks = data.result.XXBTZUSD.asks;

  highbid.clear();
  lowask.clear();

  for (var i = 0;i<bids.length;i++){
    highbid.set(bids[i][0], bids[i][1]);
  }

  for (var i = 0;i<asks.length;i++){
    lowask.set(asks[i][0], asks[i][1]);
  }
}
