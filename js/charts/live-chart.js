$( document ).ready(function() {

  /*
  * [General Notes]
  * Dynamic charts are created using websockets.
  * Data is fed into the chart object and Highcharts takes
  * care of the rest.
  *
  * Webockets -- (data) --> Highcharts.series[]
  *
  * Abstraction function:
  * series.data: [ [time,price], [time,price], [time,price], ...]
  *
  * TODO:  Add functions (like updateChart()) before $() call that would show
  *         or display different data to user. [frontend]
  *
  * TODO:  Add Exchange name to websockets feed so app knows what title to
  *        display.
  */

  $('#container').highcharts('StockChart', {

    // Range selectors can be used to adding time frames to the chart
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

    // TODO: Change title based on current data feed.
    //        "Data from X, Y, and Z exchanges"
    title: {
      text: 'Stock Price'
    },
    subtitle: {
      text: 'Live updates for BTC'
    },

    xAxis: {
      type: 'datetime'
    },

    chart: {
      //type: 'spline',

      // Event listener is used to capture data from websocket
      events: {
        load: function() {

          var self = this;
          var socket = io.connect('http://localhost:3000');

          // Separate highbid/lowask streams are fed to their own Highcharts series.
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

    /*
    * Each series is a line on the chart.
    * Data streams from websockets listener pushes certain data to
    * to each of the Highest Bid and Lowest Ask data series.
    */
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
