/**
 * Adds a date and price as a tuple to a targetSeries
 * @param {HighChart.series} targetSeries reference
 * @param {int} date UTC formatted time
 * @param {int} price currency price
 */
var addDataPointToSeries = function (targetSeries, date, price) {
  targetSeries.addPoint([date, price], false);
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
var addTickerDatasetToSeries = function (targetSeries, tickerData) {
  for (var i = 0; i < tickerData.length; i++) {
    var date = tickerData[i].date * 1000;
    var price = tickerData[i].close;
    console.log('adding point...');
    addDataPointToSeries(targetSeries, date, price);
  }
};

/**
 * Adds data points to a certain series, given a data set (chartData)
 * @param {HighChart.series} targetSeries reference
 * @param {object} chartData
 */
var addBacktestDatasetToSeries = function (targetSeries, tickerData) {
  for (var i = 0; i < tickerData.length; i++) {
    var date = tickerData[i][0] * 1000;
    var price = tickerData[i][1];
    console.log('backtest: adding point...');
    addDataPointToSeries(targetSeries, date, price);
  }
};

/**
 * Adds data points to a certain series, given a data set (chartData)
 * @param {HighChart.series} targetSeries reference
 * @param {object} chartData
 */
var addBenchMarkDatasetToSeries = function (targetSeries, tickerData) {
  for (var i = 0; i < tickerData.length; i++) {
    var date = tickerData[i][0] * 1000;
    var price = tickerData[i][1];
    console.log('benchmark: adding point...');
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
    //console.log('date:', date, 'price:', price);
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
    radius: 2
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
var createIndicatorSeries = function (highchart, name, spline) {
  var seriesObj = {};
  seriesObj.name = name;
  seriesObj.id = name;
  seriesObj.data = [];
  seriesObj.marker = {
    enabled: false,
    radius: 3
  };
  if (spline == true) {
    seriesObj.type = 'spline';
  }
  seriesObj.tooltip = {
    valueDecimals: 5
  };
  highchart.addSeries(seriesObj, true);
};


var createFlagSeries = function (highchart) {
  var seriesObj = {};
  seriesObj.id = 'flags';
  seriesObj.type = 'flags';
  seriesObj.data = [];
  seriesObj.onSeries = 'Closing Price';
  seriesObj.shape = 'circlepin';
  seriesObj.width = 20;

  highchart.addSeries(seriesObj);
};


/**
 * Every flag consists of x, title and text. The attribute "x" must be set to
 * the point where the flag should appear. The attribute "title" is the text
 * which is displayed inside the flag on the chart. The attribute "text" contains
 * the text which will appear when the mouse hover above the flag.
 */
var addFlagToSeries = function (highchart, timeStamp, order) {
  var flagObj = {};
  console.log('inside addFlagToSeries:', timeStamp, order);
  flagObj.x = timeStamp;
  flagObj.title = order;
  flagObj.text = 'Make a trade here.';

  highchart.get('flags').addPoint(flagObj);
};


/**
 * Connects and listens on two sockets to initialize and then update a chart.
 *     initializedChartData creates a series and adds historical data to it.
 *     updatedChartData listens for live data and adds it to a targetSeries
 * @param {HighChart} highchart self reference
 */
var loadStrategyTrades = function (highchart) {
  var socket = io.connect('http://localhost:3000');
  console.log('CONNECTION RECEIVED. SERVER RUNNING AT http://localhost:3000');
  highchart.showLoading('<img src="/assets/ostia-ship-blue-loading.png">');


  // INITALIZE CHART WITH HISTORICAL DATA
  socket.on('initializedChartData', function (chartData) {

    console.log('### initializedChartData received...');
    console.log('### creating series...');

    console.log(Object.keys(chartData));

    createCandlestickSeries(highchart, 'Closing Price');
    createIndicatorSeries(highchart, '10-Day Moving Average');
    createIndicatorSeries(highchart, '20-Day Moving Average');

    /* Creating tickerData chart lines */
    var tickerData = chartData.tickerData;
    // console.log(tickerData);
    var targetSeries = highchart.get("Closing Price");
    addTickerDatasetToSeries(targetSeries, tickerData);
    //
    // /* Adding indicators */
    var SMA_A = chartData.indicators[0];
    var targetSMA10 = highchart.get('10-Day Moving Average');
    console.log('### adding SMA10 to chart');
    addIndicatorDatasetToSeries(targetSMA10, SMA_A);

    var SMA_B = chartData.indicators[1];
    var targetSMA20 = highchart.get('20-Day Moving Average');
    console.log('### adding SMA20 to chart');
    addIndicatorDatasetToSeries(targetSMA20, SMA_B);

    // /* Adding order flags */
    createFlagSeries(highchart);
    for (var i = 0; i < chartData.flags.length; i++) {
      console.log('flag added');
      var timeStamp = chartData.flags[i].timestamp * 1000;
      var orderLongShort = chartData.flags[i].longShort;
      addFlagToSeries(highchart, timeStamp, orderLongShort);
    }

    highchart.hideLoading();

  });


  // UPDATE CHART WITH LIVE DATA
  socket.on('updatedChartData', function (chartData) {
    console.log("### CLIENT: Live Data Point Received");
    var date = chartData.time;
    var price = parseFloat(chartData.mostRecentTickerPrice);
    var targetSeries = highchart.get('Closing Price');
    addLiveDataPointToSeries(targetSeries, date, price);
  });
};


/**
 * Connects and listens on two sockets to initialize and then update a chart.
 *     initializedChartData creates a series and adds historical data to it.
 *     updatedChartData listens for live data and adds it to a targetSeries
 * @param {HighChart} highchart self reference
 */
var loadPortfolioPerformance = function (highchart) {
  var socket = io.connect('http://localhost:3000');
  console.log('CONNECTION RECEIVED. SERVER RUNNING AT http://localhost:3000');
  highchart.showLoading('<img src="/assets/ostia-ship-blue-loading.png">');

  // INITALIZE CHART WITH HISTORICAL DATA
  socket.on('backtest', function (chartData) {

    console.log('### <Backtest> received...');
    console.log(Object.keys(chartData));

    /* Creating tickerData benchmark chart lines */
    createIndicatorSeries(highchart, 'Benchmark', false);
    var bm = chartData.benchmark;
    var bmtarget = highchart.get('Benchmark');
    addBenchMarkDatasetToSeries(bmtarget, bm);

    /* Creating tickerData chart lines */
    createIndicatorSeries(highchart, 'Backtest', false);
    var bt = chartData.backtest;
    //console.log(chartData);
    var btarget = highchart.get('Backtest');
    addBacktestDatasetToSeries(btarget, bt);



    /* This line needs to be here for some reason, or else chart won't render properly... */
    createFlagSeries(highchart);

    highchart.hideLoading();
  });
};


$(document).ready(function () {
  $('#hcharts-strategy').highcharts('StockChart', {
    plotOptions: {
      series: {
        dataGrouping: {
          enabled: true,
          groupPixelWidth: 4
        }
      }
    },
    rangeSelector: {
      buttons: [{
        type: 'month',
        count: 1,
        text: '1m'
      }, {
        type: 'month',
        count: 3,
        text: '3m'
      }, {
        type: 'month',
        count: 6,
        text: '6m'
      }, {
        type: 'ytd',
        text: 'YTD'
      }, {
        type: 'year',
        count: 1,
        text: '1y'
      }, {
        type: 'all',
        text: 'All'
      }],
      inputEnabled: false,
      selected: 1
    },

    title: {
      text: 'Moving Avg. Crossover Trades'
    },
    subtitle: {
      text: '+ Indicators (BTC/USD)'
    },
    xAxis: {
      type: 'datetime',
      ordinal: false
    },
    // yAxis:
    //   [{
    //     title: {
    //       text: 'Ticker',
    //     },
    //     opposite: false
    //   }
    // ],
    chart: {
      events: {
        load: function () {
          var self = this;
          loadStrategyTrades(self);
        }
      },
    },
    series: []
  });


  $('#hcharts-portfolio').highcharts('StockChart', {
    plotOptions: {
      series: {
        dataGrouping: {
          enabled: true,
          groupPixelWidth: 4
        }
      }
    },
    rangeSelector: {
      buttons: [{
        type: 'month',
        count: 1,
        text: '1m'
      }, {
        type: 'month',
        count: 3,
        text: '3m'
      }, {
        type: 'month',
        count: 6,
        text: '6m'
      }, {
        type: 'ytd',
        text: 'YTD'
      }, {
        type: 'year',
        count: 1,
        text: '1y'
      }, {
        type: 'all',
        text: 'All'
      }],
      inputEnabled: false,
      selected: 1
    },

    title: {
      text: 'Portfolio Performance'
    },
    subtitle: {
      text: 'Moving Average Crossover Strategy'
    },
    xAxis: {
      type: 'datetime',
      ordinal: false
    },
    // yAxis:
    //   [{
    //     title: {
    //       text: 'Value',
    //     },
    //     opposite: false
    //   }
    // ],
    chart: {
      events: {
        load: function () {
          var self = this;
          loadPortfolioPerformance(self);
        }
      },
    },
    series: []
  });
});
