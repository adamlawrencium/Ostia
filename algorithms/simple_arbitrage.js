exports.output = function (data){

    // Temporary variables for algorithm
    var highest_bid = 0;
    var highest_bid_amt = 0;
    var lowest_ask = 10000000000;
    var lowest_ask_amt = 0;
    var low_amt;

    // Condensing maps into the highest bid and lowest ask
    var Polo_Info = large_polo(data[0],data[1]);
    var GDAX_Info = large_GDAX_Bit(data[2], data[3]);
    var Bitf_Info = large_GDAX_Bit(data[4], data[5]);
    var Krak_Info = large_polo(data[6], data[7]);

    // Creating a overall array to store highest bids and lowest asks
    var overall = [Polo_Info, GDAX_Info, Bitf_Info, Krak_Info];

    // Finding the absolute highest bid and lowest ask
    for (var i=0; i<overall.length; i++){
        if (overall[i][0]>highest_bid){
            highest_bid = overall[i][0];
            highest_bid_amt = overall[i][1];
        }
        if (overall[i][2]<lowest_ask){
            lowest_ask = overall[i][2];
            lowest_ask_amt = overall[i][3];
        }
    }

    // Finding the volume available to be traded
    if (highest_bid_amt < Math.abs(lowest_ask_amt)){
        low_amt = highest_bid_amt;
    }
    else {
        low_amt = Math.abs(lowest_ask_amt);
    }

    // Entering fees
    var fee = .9975;

    var fee2 = .9975;

    // Calculating Profit
    var sell_profit = (highest_bid*low_amt*fee);
    var buy_loss = ((lowest_ask*low_amt)/fee2);
    var lel = (sell_profit-buy_loss);


    //if (lel > 0){
    console.log("Polo:\t" + Polo_Info[0] + ", " + Polo_Info[1] + "\t|\t" + Polo_Info[2] + ", " + Polo_Info[3]);
    console.log("GDAX:\t" + GDAX_Info[0] + ", " + GDAX_Info[1] + "\t|\t" + GDAX_Info[2] + ", " + GDAX_Info[3]);
    console.log("Bitf:\t" + Bitf_Info[0] + ", " + Bitf_Info[1] + "\t|\t" + Bitf_Info[2] + ", " + Bitf_Info[3]);
    console.log("Krak:\t" + Krak_Info[0] + ", " + Krak_Info[1] + "\t|\t" + Krak_Info[2] + ", " + Krak_Info[3]);
    console.log();
    console.log(lel);
    console.log();
    //}

}



function large_polo (highbid, lowask){
    // Initializing temporary variables for sorting through the maps
    var tmp_highbid = 0,
    tmp_lowask = 1000000000000000,
    tmp_amt_highbid = 0,
    tmp_amt_lowask = 0;

    // Sorting out the highest bid
    highbid.forEach(function(value,key){
        if (key > tmp_highbid){
            tmp_highbid = key;
            tmp_amt_highbid = value;
        }
    }, highbid)

    // Sorting out the lowest ask
    lowask.forEach(function(value,key){
        if (key < tmp_lowask){
            tmp_lowask = key;
            tmp_amt_lowask = value;
        }
    }, lowask)

    return [tmp_highbid, tmp_amt_highbid, tmp_lowask, tmp_amt_lowask];
}

function large_GDAX_Bit(highbid, lowask){

    // Initializing temporary variables for sorting through the maps
    var tmp_highbid = 0,
    tmp_lowask = 1000000000000000,
    tmp_amt_highbid = 0,
    tmp_amt_lowask = 0;

    // Sorting out the highest bid
    highbid.forEach(function(value,key){
        if (value.rate > tmp_highbid){
            tmp_highbid = value.rate;
            tmp_amt_highbid = parseFloat(value.amount);
        }
        else if (value.rate == tmp_highbid){
            tmp_amt_highbid += parseFloat(value.amount);
        }
    }, highbid);

    // Sorting out the lowest ask
    lowask.forEach(function(value,key){
        if (value.rate < tmp_lowask){
            tmp_lowask = value.rate;
            tmp_amt_lowask = parseFloat(value.amount);
        }
        else if (value.rate == tmp_lowask){
            tmp_amt_lowask += parseFloat(value.amount);
        }
    }, lowask)

    return [tmp_highbid, tmp_amt_highbid, tmp_lowask, tmp_amt_lowask];
}
