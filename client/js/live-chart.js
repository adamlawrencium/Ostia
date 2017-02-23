/**
 * Adds a date and price as a tuple to a targetSeries
 * @param {HighChart.series} targetSeries reference
 * @param {int} date UTC formatted time
 * @param {int} price currency price
 */
var addDataPointToSeries = function (targetSeries, date, price) {
  targetSeries.addPoint([date, price], false);
  // tities
};

// Adds a live data point to a series, differs from "addDataPointToSeries"
//    because it defaults to true for redrawing the chart, hence a "live"
//    addPoint functionality
var addLiveDataPointToSeries = function (targetSeries, date, price) {
  targetSeries.addPoint([date, price], true);
};

/**
 * Adds data points to a certain series, given a data set (chartData)
 * @param {HighChart.series} targetSeries reference
 * @param {object} chartData
 */
var addCandlestickDatasetToSeries = function (targetSeries, candlestick) {
  for (var i = 0; i < candlestick.length; i++) {
    var date = candlestick[i].date * 1000;
    var price = candlestick[i].close;
    console.log('adding point...');
    addDataPointToSeries(targetSeries, date, price);
  }
};

/**
 * Adds data points to a certain series, given a data set (chartData)
 * @param {HighChart.series} targetSeries reference
 * @param {array[][]} chartData
 */
var addIndicatorDatasetToSeries = function (targetSeries, chartData) {
  for (var i = 0; i < chartData.length; i++) {
    var date = chartData[i][0] * 1000;
    var price = chartData[i][1];
    console.log('date:', date, 'price:', price);
    addDataPointToSeries(targetSeries, date, price);
  }
};


/**
 * Creates object literal, given paramaters, and adds it to highchart
 * @param {HighChart} highchart self reference
 * @param {object} params parameters to add to series
 */
var createCandlestickSeries = function (highchart, name) {
  var seriesObj = {};
  seriesObj.name = name;
  seriesObj.id = name;
  seriesObj.data = [];
  seriesObj.marker = {
    enabled: true,
    radius: 3
  };
  seriesObj.tooltip = {
    valueDecimals: 5
  };
  highchart.addSeries(seriesObj, true);
};

/**
 * Creates object literal, given paramaters, and adds it to highchart
 * @param {HighChart} highchart self reference
 * @param {object} params parameters to add to series
 */
var createIndicatorSeries = function (highchart, name) {
  var seriesObj = {};
  seriesObj.name = name;
  seriesObj.id = name;
  seriesObj.data = [];
  seriesObj.marker = {
    enabled: false,
    radius: 3
  };
  seriesObj.type = 'spline';
  seriesObj.tooltip = {
    valueDecimals: 5
  };
  highchart.addSeries(seriesObj, true);
};

// Flags are a new series that contains a list of objects. The first object is
/**
{
  type: 'flags',
  data [
  {
    x: Date.UTC(2015, 5, 8),
    title: 'C',
    text: 'Stocks fall on Greece, rate concerns; US dollar dips'
    }, {
    x: Date.UTC(2015, 5, 12),
    title: 'D',
    text: 'Zimbabwe ditches \'worthless\' currency for the US dollar '
    }
  ],
  onSeries: 'dataseries',
  shape: 'circlepin',
  width: 16
}
*/
var createFlagSeries = function (highchart) {
  var seriesObj = {};
  seriesObj.


}

/**
 * Every flag consists of x, title and text. The attribute "x" must be set to
 * the point where the flag should appear. The attribute "title" is the text
 * which is displayed inside the flag on the chart. The attribute "text" contains
 * the text which will appear when the mouse hover above the flag.
*/
var addFlag = function (highchart, targetSeries, timestamp, options) {



}




/**
 * Connects and listens on two sockets to initialize and then update a chart.
 *     initializedChartData creates a series and adds historical data to it.
 *     updatedChartData listens for live data and adds it to a targetSeries
 * @param {HighChart} highchart self reference
 */
var loadChartData = function (highchart) {
  var socket = io.connect('http://localhost:3000');
  console.log('CONNECTION RECEIVED. SERVER RUNNING AT http://localhost:3000');

  // INITALIZE CHART WITH HISTORICAL DATA
  socket.on('initializedChartData', function (chartData) {

    console.log('### initializedChartData received...');
    console.log('### creating series...');

    createCandlestickSeries(highchart, 'Closing Price');
    createIndicatorSeries(highchart, '10-Day Moving Average');
    createIndicatorSeries(highchart, '20-Day Moving Average');

    // Creating candlestick chart lines
    var candlestickData = chartData.candlestickData;
    var targetSeries = highchart.get("Closing Price");
    addCandlestickDatasetToSeries(targetSeries, candlestickData);

    // Adding indicators
    var SMA10 = chartData.indicators.SMA10;
    var targetSMA10 = highchart.get('10-Day Moving Average');
    console.log('### adding SMA10 to chart');
    addIndicatorDatasetToSeries(targetSMA10, SMA10);

    var SMA20 = chartData.indicators.SMA20;
    var targetSMA20 = highchart.get('20-Day Moving Average');
    console.log('### adding SMA20 to chart');
    addIndicatorDatasetToSeries(targetSMA20, SMA20);

    console.log(highchart.series);
    highchart.redraw();
  });


  // UPDATE CHART WITH LIVE DATA
  socket.on('updatedChartData', function (chartData) {
    console.log("### CLIENT: Live Data Point Received")
    var date = chartData.time;
    var price = parseFloat(chartData.mostRecentTickerPrice);
    var targetSeries = highchart.get('Closing Price');
    addLiveDataPointToSeries(targetSeries, date, price);
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
          enabled: true,
          groupPixelWidth: 15
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
      type: 'datetime',
      ordinal: false
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
