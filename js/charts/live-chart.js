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
            var n = 0;
            var socket = io.connect('http://localhost:3000');

            socket.on('message', function(data) {
              //console.log([data.message[0],data.message[1]]);

              var tim = (new Date()).getTime()
              var y   = Math.random();
              //self.series[0].addPoint([tim, y]);

              var time    = data.message[0];
              var highbid = parseFloat(data.message[1]);
              var lowask  = parseFloat(data.message[2]);

              self.series[0].addPoint([tim, highbid]);
              self.series[1].addPoint([tim, lowask]);

              console.log('highbid' + typeof(highbid));
              //self.redraw();
              // for (var entry in self.series.data) {
              //   if (self.series[0].hasOwnProperty(entry)) {
              //     console.log(entry);
              //   }
              // }

              //console.log(self.series[0].setData([time,lowask]));

              //self.series.addPoint([data.message[0],data.message[1]]);
              //self.series[0].setData([data.message[0],n]);
              n = n * (1.01);
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
        tooltip:  { valueDecimals: 2 }
      },
      {
        name: 'Lowest Ask',
        data: [],
        marker:   { enabled: true, radius: 3},
        tooltip: { valueDecimals: 2},

      }]
    });
  });
});
