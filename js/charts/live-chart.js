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
        text: 'fasdfas Stock Price'
      },
      chart: {
        type: 'spline',
        events: {
          load: function() {

            var self = this;
            var n = 0;
            var socket = io.connect('http://localhost:3000');

            socket.on('message', function(data) {
              //console.log([data.message[0],data.message[1]]);

              var tim = (new Date()).getTime()
              var y   = Math.random();
              self.series[0].addPoint([tim, y]);

              var time    = data.message[0];
              var highbid = data.message[1];
              var lowask  = data.message[2];
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
        name: 'BANANA',
        data: [],
        /*data: [
        [1475452800000,112.52],
        [1475539200000,113.00],
        [1475625600000,113.05],
        [1475712000000,113.89],
        [1475798400000,114.06],
        [1476057600000,116.05],
        [1476144000000,116.30],
        [1476230400000,117.34],
        [1476316800000,116.98],
        [1476403200000,117.63],
        [1476662400000,117.55],
        [1476748800000,117.47]
      ],*/
      tooltip: {
        valueDecimals: 2
      }
    }]
  });
});
});
