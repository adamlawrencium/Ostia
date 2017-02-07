var addDataPointToSeries = function(highchart, seriesName, date, price) {
  console.log('adding point...', date, price);    // debugging purposes
  console.log(highchart);
  console.log(highchart.series)
  console.log(highchart.series.seriesName);
  highchart.series.seriesName.addPoint([date, price]);
};

var addDatasetToSeries = function(highchart, seriesName, chartData) {
  var seriesIndex = 0;
  for (var i = 0; i < highchart.series.length; i++) {
    if (highchart.series[i] == seriesName) {
      console.log('FOUND SERIES');
      seriesIndex = i;
    }
  }
  for (var i = 0; i < chartData.length; i++) {
    addDataPointToSeries(highchart, chartData[i].date*1000, chartData[i].close);
  }
};


// TODO: add other handlers for highcharts
var createSeries = function(highchart, params) {
  var seriesObj = {};
  seriesObj.name     = "testName";
  seriesObj.data     = [];
  seriesObj.marker   = { enabled: true, radius: 3 };
  seriesObj.tooltip  = { valueDecimals: 5 };
  highchart.series.push(seriesObj);
  console.log(seriesObj);
};


var loadChartData = function(highchart) {
  var socket = io.connect('http://localhost:3000');

  socket.on('initializedChartData', function(data) {
    createSeries(highchart, null);
    var chartData = data.data;                      // TODO: clean up data.data
    addDatasetToSeries(highchart, "testName", chartData);

  });

  socket.on('updatedChartData', function(chartData) {
    var time = chartData.time;
    var price = parseFloat(chartData.livefeed.last);
    addDataPointToSeries(highchart, "testName", time, price);
  });
};


$(document).ready(function () {

  /*
  * [General Notes]
  * Dynamic charts are created using websockets.
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
      text: 'Charts w/ Historical Data'
    },
    subtitle: {
      text: '+ Live updates'
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
    series: []
  });
});
