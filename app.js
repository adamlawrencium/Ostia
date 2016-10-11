var request = require('request');
var options =
{
    url : 'https://api.kraken.com/0/public/Depth',
    form : {
        "pair" : "XETHXXBT",
        "count": 10
    }
};
highbid_krak = new Map();
lowask_krak = new Map();

var parse_krak = require("./data-parsing/kraken.js").parse;

var t = setInterval(krak_call, 1000);
function krak_call(){
    request.post(options, function(error, response, body){
        if (body[0]!='<'){
            var data = JSON.parse(body);
            parse_krak(data, highbid_krak, lowask_krak);
            output();
        }
    });
}

// Autobahn Connection Setup
var autobahn = require('autobahn');
var wsuri = "wss://api.poloniex.com";
var connection = new autobahn.Connection({
    url: wsuri,
    realm: "realm1"
});


var highbid = new Map();
var lowask = new Map();

var arbitrage = require("./algorithms/simple_arbitrage.js").output;

// Passing in parsing method from poloniex.js
var parse_polo = require("./data-parsing/poloniex.js").parse;

// Subscribing to BTC_ETH order book updates and parsing data
connection.onopen = function (session) {

    function on_recieve2 (args, kwargs){
        parse_polo(args, highbid, lowask);
        output();
    }
    //session.subscribe('USDT_BTC', on_recieve2);
    session.subscribe('BTC_ETH', on_recieve2);

    session.subscribe('ticker', on_recieve);


}

// Setting up WS Connection
var WebSocket = require('ws');

var ws = new WebSocket('wss://ws-feed.gdax.com');

var ws_bit = new WebSocket('wss://api2.bitfinex.com:3000/ws');


// Bittrex request
/*
var subscribe_bit =
{
"event": "subscribe",
"channel": "book",
"pair": "BTCUSD",
"prec": "R0",
"len":"25"
};
*/
var subscribe_bit =
{
    "event": "subscribe",
    "channel": "book",
    "pair": "ETHBTC",
    "prec": "R0",
    "len":"25"
};

ws_bit.on('open',function(){
    ws_bit.send(JSON.stringify(subscribe_bit));
});

var highbid_Bit = new Map();
var lowask_Bit = new Map();

// Passing in parsing method from poloniex.js
var parse_Bit = require("./data-parsing/bitfinex.js").parse;
var parse_Bit_snap = require("./data-parsing/bitfinex_snap.js").parse;

var il = 0;

ws_bit.on('message', function(data, flags){
    if(il == 2 ) {
        parse_Bit_snap(JSON.parse(data), highbid_Bit, lowask_Bit);
    }
    else if (il > 2){

        parse_Bit(JSON.parse(data), highbid_Bit, lowask_Bit);
        output();
    }
    il++;
});


// Setting up the subscribe message
/*
var subscribeBTC = {
"type": "subscribe",
"product_ids": [
"BTC-USD",
]
};
*/

var subscribeBTC = {
    "type": "subscribe",
    "product_ids": [
        "ETH-BTC",
    ]
};

// Subscribing to heartbeat messages
var heartbeat = {
    "type": "heartbeat",
    "on": true
};



// On websocket connection, send the subscribe and heartbeat JSON strings
ws.on('open',function() {
    ws.send(JSON.stringify(subscribeBTC));
    ws.send(JSON.stringify(heartbeat));
});

//========SAMPLE GDAX PARSING WITH MAPS=========
var highbid_GDAX = new Map();
var lowask_GDAX = new Map();

// Passing in parsing method from poloniex.js
var parse_GDAX = require("./data-parsing/GDAX.js").parse;

// When a message is recieved, parse it given the maps
ws.on('message', function(data, flags) {
    parse_GDAX(data, highbid_GDAX, lowask_GDAX);
    output();
});

// Setting up basic Express server
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// Rendering index.html
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

// Rendering dashboard.html
app.get('/dashboard', function (req, res) {
    res.sendfile(__dirname + '/dashboard.html');
});

// Function for Autobahn websocket feed
function on_recieve(args, kwargs) {

    if (args[0]=='BTC_ETH') { // Filtering Ticker results for BTC_ETH

        // Creating Timestamp for Updated Stock prices
        var m = new Date();
        var dateString =
        m.getUTCFullYear() +"/"+
        ("0" + (m.getUTCMonth()+1)).slice(-2) +"/"+
        ("0" + m.getUTCDate()).slice(-2) + " " +
        ("0" + m.getUTCHours()).slice(-2) + ":" +
        ("0" + m.getUTCMinutes()).slice(-2) + ":" +
        ("0" + m.getUTCSeconds()).slice(-2);

        // Emitting messages to connected clients through socket.io
        io.emit('message',{message: args[2]+", "+args[3]+", "+ m});
    }
};


var data_all = [highbid, lowask, highbid_GDAX, lowask_GDAX, highbid_Bit, lowask_Bit, highbid_krak, lowask_krak];
function output (){
    arbitrage(data_all);
}

connection.open();

// Creating Express server
server.listen(3000);
