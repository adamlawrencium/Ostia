var express = require('express');
var path = require('path');
var ejs = require('ejs');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



//var mongoose = require('mongoose');
//var configDB = require('./config/database');
//var Data     = require('./mongoose/pol_schema');
//mongoose.connect(configDB.url); // connect to our database


var stream = require('./websockets/auto');


var http = require('http');

var app = express();



var port = normalizePort(process.env.PORT || '3000');




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', port);



app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));





app.get('/', function (req, res) {
  res.sendfile(__dirname + '/views/socket.html');
});





function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

var server = http.createServer(app);

server.listen(port);

stream.open();


module.exports = app;
