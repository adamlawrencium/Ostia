exports.parse = function (args, highbid, lowask){
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
}
