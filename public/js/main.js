// import highchartsObj from 'chartObj.js';
// console.log(highchartsObj);

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
  if (!chartData) { return; }
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
  $('.progress').hide();
  highchart.redraw();
};

function createHighChartsObj(ops) {
  let chartTitle; let A; let B; let data;
  console.log(ops);
  chartTitle = 'Select to cryptocurrencies to view their chart!';
  if (ops) {   
    A = ops.A;
    B = ops.B;
    chartTitle = `Historical Prices - ${A}/${B}`;
    data = ops.data;
  }
  return {
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
        type: 'day',
        count: 1,
        text: '1d'
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
    lang: {
      noData: 'No data to display mann'
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '15px',
        color: '#303030'
      }
    },
    title: {
      text: chartTitle
    },
    xAxis: {
      type: 'datetime',
      ordinal: false
    },
    chart: {
      events: {
        load() {
          const self = this;
          loadStrategyTrades(self, data);
        }
      },
    },
    series: []
  };
}


$(document).ready(() => {
  $('#hcharts-strategy').highcharts('StockChart', createHighChartsObj());
  const chartData = null;
  // $('.progress').show();
  $('#chartButton').click(() => {
    $('.progress').show();
    const A = $('#baseCurrency').val();
    const B = $('#tradeCurrency').val();
    console.log(`Loading chart for ${A}_${B}...`);
    $.getJSON(`/data?currencyA=${A}&currencyB=${B}`, (data) => {
      const ops = {};
      ops.A = A; ops.B = B; ops.data = data;
      console.log(ops);
      $('#hcharts-strategy').highcharts('StockChart', createHighChartsObj(ops));
    });
  });
});
