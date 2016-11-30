
// TODO: Create some sort of updating/reset function for highcharts,
//        currently the data changes, but the chart won't reset
// TODO: Determine which data should be sent to the client for visualizations
var socket = io.connect('http://localhost:3000')
function Graph (data) {
  var exchange = data

    // Closing the previous exchange feed and starting the new one
  socket.emit('closeExchange', {data: null})
  socket.emit('openExchange', {data: exchange})
}
