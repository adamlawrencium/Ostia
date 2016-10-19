$( document ).ready(function() {
  $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function (data) {



    // When a stock update is received it's inserted in the page
    socket.on('message', function(data) {
      //insertStock(data.message);
      updateChart(data.message);
    })

    // Adds a stock update to the page
    function insertStock(message) {
      //    $('#stock_zone').prepend('</strong> ' + message + '</p>');
    }

    function updateChart(message) {
      // append [ [time,price], [time,price], [time,price], ...] to series
    }

    /*
    High Charts Notes

    data:   [ [x,y], [x,y], [x,y], ...]
    [ [time,price], [time,price], [time,price], ...]
    Use "Zones" for visual effect

    */



    $('#container').highcharts('StockChart', {

      rangeSelector: {
        buttons: [{
          count: 1,
          type: 'minute',
          text: '1M'
        }, {
          count: 5,
          type: 'minute',
          text: '5M'
        }, {
          count: 10,
          type: 'minute',
          text: '10M'
        }, {
          type: 'all',
          text: 'All'
        }],
        inputEnabled: false,
        selected: 0
      },

      title: {
        text: 'Stock Price'
      },
      chart: {
        //type: 'spline',
        events: {
          load: function() {

            var self = this;
            var socket = io.connect('http://localhost:3000');

            socket.on('message', function(data) {

              var time    = data.message[0];
              var highbid = parseFloat(data.message[1]);
              var lowask  = parseFloat(data.message[2]);

              self.series[0].addPoint([time, highbid]);
              self.series[1].addPoint([time, lowask]);

            })
          }
        }
      },

      subtitle: {
        text: 'Live updates for BTC'
      },

      xAxis: {
        type: 'datetime'
      },

      series: [{
        name: 'Highest Bid',
        data: [],
        marker:   { enabled: true, radius: 3},
        tooltip:  { valueDecimals: 5 }
      },
      {
        name: 'Lowest Ask',
        data: [],
        marker:   { enabled: true, radius: 3},
        tooltip: { valueDecimals: 5 },

      }]
    });
  });
});
