/**
 * Adds a date and price as a tuple to a targetSeries
 * @param {HighChart.series} targetSeries reference
 * @param {int} date UTC formatted time
 * @param {int} price currency price
 */
const addDataPointToSeries = function (targetSeries, date, price) {
  targetSeries.addPoint([date, price], false);
};

/**
 * Adds data points to a certain series, given a data set (chartData)
 * @param {HighChart.series} targetSeries reference
 * @param {object} chartData
 */
const addTickerDatasetToSeries = function (targetSeries, tickerData) {
  for (let i = 0; i < tickerData.length; i++) {
    const date = tickerData[i][0] * 1000;
    const price = tickerData[i][1];
    // console.log(date, price);
    console.log('adding point...');
    addDataPointToSeries(targetSeries, date, price);
  }
};

/**
 * Creates object literal, given paramaters, and adds it to highchart
 * @param {HighChart} highchart self reference
 * @param {object} params parameters to add to series
 */
const createCandlestickSeries = function (highchart, name) {
  const seriesObj = {};
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
 * Connects and listens on two sockets to initialize and then update a chart.
 *     initializedChartData creates a series and adds historical data to it.
 *     updatedChartData listens for live data and adds it to a targetSeries
 * @param {HighChart} highchart self reference
 */
const loadStrategyTrades = function (highchart, chartData) {
  highchart.showLoading('<img src="../favicon.png">');

  // // INITALIZE CHART WITH HISTORICAL DATA
  console.log('### initializedChartData received...');
  console.log('### creating series...');

  createCandlestickSeries(highchart, 'Closing Price');
  /* Creating tickerData chart lines */
  const tickerData = chartData;
  console.log(tickerData);
  const targetSeries = highchart.get('Closing Price');
  addTickerDatasetToSeries(targetSeries, tickerData);
  highchart.hideLoading();
  highchart.redraw();
};


$(document).ready(() => {
  const chartData = null;
  $('#chartButton').click(() => {
    const A = $('#baseCurrency').val();
    const B = $('#tradeCurrency').val();
    $.getJSON(`/data?currencyA=${A}&currencyB=${B}`, (data) => {
      // console.log(data);
      const chartData = data;
      // console.log(chartData);
      $('#hcharts-strategy').highcharts('StockChart', {
        plotOptions: {
          series: {
            dataGrouping: {
              enabled: true,
              groupPixelWidth: 5
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
        chart: {
          events: {
            load() {
              const self = this;
              loadStrategyTrades(self, chartData);
            }
          },
        },
        series: []
      });
    });
  });
});
