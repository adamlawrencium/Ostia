/**
 * Adds a date and price as a tuple to a targetSeries
 * @param {HighChart.series} targetSeries reference
 * @param {int} date UTC formatted time
 * @param {int} price currency price
 */
 var addDataPointToSeries = function(targetSeries, date, price) {
  targetSeries.addPoint([date, price]);
};


/**
 * Adds data points to a certain series, given a data set (chartData)
 * @param {HighChart.series} targetSeries reference
 * @param {array} chartData
 */
var addDatasetToSeries = function(targetSeries, chartData) {
  for (var i = 0; i < chartData.length; i++) {
    var date = chartData[i].date*1000;
    var price = chartData[i].close;
    addDataPointToSeries(targetSeries, date, price);
  }
};


/**
 * Creates object literal, given paramaters, and adds it to highchart
 * @param {HighChart} highchart self reference
 * @param {object} params parameters to add to series
 */
var createSeries = function(highchart, params) {
  var seriesObj = {};
  seriesObj.name     = "testName";
  seriesObj.id       = "series-testID";
  seriesObj.data     = [];
  seriesObj.marker   = { enabled: true, radius: 3 };
  seriesObj.tooltip  = { valueDecimals: 5 };
  highchart.addSeries(seriesObj);
};


/**
 * Connects and listens on two sockets to initialize and then update a chart.
 *     initializedChartData creates a series and adds historical data to it.
 *     updatedChartData listens for live data and adds it to a targetSeries
 * @param {HighChart} highchart self reference
 */
var loadChartData = function(highchart) {
  var socket = io.connect('http://localhost:3000');

  // INITALIZE CHART WITH HISTORICAL DATA
  socket.on('initializedChartData', function(chartData) {
    createSeries(highchart, null);
    var chartData = chartData.data;
    var targetSeries = highchart.get("series-testID");
    addDatasetToSeries(targetSeries, chartData);
  });

  

  // UPDATE CHART WITH LIVE DATA
  socket.on('updatedChartData', function(chartData) {
    var date = chartData.time;
    var price = parseFloat(chartData.livefeed.last);
    var targetSeries = highchart.get("series-testID");
    addDataPointToSeries(targetSeries, date, price);
  });
};


$(document).ready(function () {
  /*
  * Webockets -- (data) --> Highcharts.series[]
  * Abstraction function:
  * series.data: [ [time,price], [time,price], [time,price], ...]
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
      events: {
        load: function () {
          var self = this;
          loadChartData(self);
        }
      },
    },
    series: []
  });
});
