var addData = function(chart, date, price) {
    console.log('adding point...', date, price);
    chart.series[0].addPoint([date, price]);
};

var loadChartData = function(chart) {
    var socket = io.connect('http://localhost:3000');

    socket.on('initializedChartData', function(data) {
        var chartData = data.data;
        for (var i = 0; i < chartData.length; i++) {
            addData(chart, chartData[i].date*1000, chartData[i].close);
        }
    });

    socket.on('updatedChartData', function(chartData) {
        var time = chartData.time;
        var price = parseFloat(chartData.livefeed.last);
        addData(chart, time, price);
    });
};

// TODO: add other handlers for highcharts
var addSeries = function(chart, params) {

};

// Temporary until we can pass in the exchange needed when rendering a chart
$(document).ready(function () {

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
  * TODO:  Find a way to pass the required exchange in when a button is pressed
  */

  $('#container').highcharts('StockChart', {

    plotOptions: {
      series: {
        // reduces 'point clutter' with large data sets
        dataGrouping: {
          enabled: false,
          groupPixelWidth: 30
        }
      }
    },
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
      text: 'Charts brah '
    },
    subtitle: {
      text: 'Live updates'
    },

    xAxis: {
      type: 'datetime'
    },

    chart: {
      // TODO: Use addSeries (instead of series literals) function with checks in place
      events: {
          load: function () {
              var self = this;
              loadChartData(self);
          }
      },
    },

    /*
    * Each series is a line on the chart.
    * Data streams from websockets listener pushes certain data to
    * to each of the Highest Bid and Lowest Ask data series.
    */
    series: [{
      name: 'PRICE',
      data: [],
      marker: { enabled: true, radius: 3 },
      tooltip: { valueDecimals: 5 }
    }, {
      name: 'PRICE',
      data: [],
      marker: { enabled: true, radius: 3 },
      tooltip: { valueDecimals: 5 }
    }]
  });
});
