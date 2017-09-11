// import highchartsObj from 'chartObj.js';
// console.log(highchartsObj);

window.SMA = function (candleStickData, MAWindowSize) {
  console.log('Calculating SMA for chart with', MAWindowSize, 'window size.');
  // Calcuating interval between the dates, and the amount of values needed each day
  const interval = candleStickData[1][0] - candleStickData[0][0];
  const entryPerDay = 86400 / interval;
  const MATimeSeries = [];
  let prev = null;
  let avg = 0;
  // Looping through each entry in the candleStickData object
  for (let i = 0; i < candleStickData.length; i += 1) {
    // Initial set-up of the first SMA average that can be calculated
    if (i === (MAWindowSize * entryPerDay) - 1) {
      for (let j = 0; j < MAWindowSize * entryPerDay; j += 1) {
        avg += candleStickData[j][1];
      }
      avg /= (MAWindowSize * entryPerDay);
      MATimeSeries.push([candleStickData[i][0], avg]);
      prev = candleStickData[0][1];
    }
    // Each time after the initial set-up, the avg is subtracted by the prev,
    //  and is added to the newest value
    if (i > (MAWindowSize * entryPerDay) - 1) {
      avg = (avg - (prev / (MAWindowSize * entryPerDay))) +
        (candleStickData[i][1] / (MAWindowSize * entryPerDay));
      MATimeSeries.push([candleStickData[i][0], avg]);
      prev = candleStickData[i - ((MAWindowSize * entryPerDay) - 1)][1];
    }
  }
  return MATimeSeries;
};

window.EMA = function (candleStickData, MAWindowSize) {
  // Calcuating interval between the dates, and the amount of values needed each day
  const interval = candleStickData[1][0] - candleStickData[0][0];
  const entryPerDay = 86400 / interval;
  const MATimeSeries = [];
  //var prev = null;
  let avg = 0;
  let multiplier = 2 / (MAWindowSize + 1);

  // Looping through each entry in the candleStickData object
  for (let i = 0; i < candleStickData.length; i += 1) {
    // Initial set-up of the first EMA (which happens to be a SMA calculation)
    if (i === (MAWindowSize * entryPerDay) - 1) {
      for (let j = 0; j < MAWindowSize * entryPerDay; j += 1) {
        avg += candleStickData[j][1];
      }
      avg /= (MAWindowSize * entryPerDay);
      MATimeSeries.push([candleStickData[i][0], avg]);
    }

    // Each time after the initial set-up, the formula for EMA is calculated
    //    http://stockcharts.com/school/doku.php?id=chart_school:technical_indicators:moving_averages
    //    Essentially the EMA = multiplier * (close - EMA_prev) + EMA_prev
    if (i > (MAWindowSize * entryPerDay) - 1) {
      let prev_EMA = MATimeSeries[i - ((MAWindowSize * entryPerDay) - 1) - 1][1];
      avg = (multiplier * (candleStickData[i][1] - prev_EMA)) + prev_EMA;
      MATimeSeries.push([candleStickData[i][0], avg]);
    }
  }
  return MATimeSeries;
};

/**
 * Creates object literal, given paramaters, and adds it to highchart
 * @param {HighChart} highchart self reference
 * @param {object} params parameters to add to series
 */
const createIndicatorSeries = function (highchart, name, spline) {
  const seriesObj = {};
  seriesObj.name = name;
  seriesObj.id = name;
  seriesObj.lineWidth = 1.25;
  seriesObj.marker = {
    enabled: false,
    radius: 3
  };
  if (spline === true) {
    seriesObj.type = 'spline';
  }
  seriesObj.tooltip = {
    valueDecimals: 5
  };
  highchart.addSeries(seriesObj, true);
};


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

const csvToAddData = function (chartData, mainChart, inputParam, indKey) {
  // Parsing pattern for csv SMA values
  const pattern = /\s*,\s*/;
  const userInputChartList = inputParam.split(pattern);

  // Transferring list of current charts to seperate array, ignoring i = 0
  //  and i = mainChart.series.length - 1, as those are occupied by the
  //  candlestick data and the series info display respectively
  const chartList = [];
  for (let i = 1; i !== mainChart.series.length - 1; i += 1) {
    if (mainChart.series[i].name.slice(0, 3) === indKey) {
      chartList.push(mainChart.series[i].name);
    }
  }

  // This set of functions manages multiple entries of csv inputs, and updates
  //  the chart to the newest input. For example, if 5, 10 is entered first,
  //  5 and 10 indicators are added. If 10, 15 is entered next, 5 is removed,
  //  10 remains, and 15 is added.

  // Removing any series not specified in userInputChartList (the array of
  //  indicators to be displayed)
  for (let i = 0; i !== chartList.length; i += 1) {
    let shouldExist = false;
    for (let j = 0; j !== userInputChartList.length; j += 1) {
      let tmpUICL = indKey + userInputChartList[j];
      if (chartList[i] === tmpUICL) {
        shouldExist = true;
      }
    }
    // If a currently existing series does not appear anywhere in the user
    //  inputted list of indicators, remove it
    if (!shouldExist) {
      mainChart.get(chartList[i]).remove();
    }
  }

  // Adding new series from the user inputted list
  for (let i = 0; i !== userInputChartList.length; i += 1) {
    let exists = false;
    for (let j = 0; j !== chartList.length; j += 1) {
      let tmpUICL = indKey + userInputChartList[i];
      if (chartList[j] === tmpUICL) {
        exists = true;
      }
    }
    // If a user inputted indicator appears nowhere in the the current chart
    //  add it
    let indCreator = null;
    if (!exists) {
      if (indKey === 'SMA') {
        indCreator = window.SMA(chartData, userInputChartList[i]);
      } else if (indKey === 'EMA') {
        indCreator = window.EMA(chartData, userInputChartList[i]);
      }
      console.log(indCreator);
      // Creating a unique id for this indicator
      let id = indKey + userInputChartList[i];

      // Creating indicator series for selected indicator
      createIndicatorSeries(mainChart, id, true);
      const targetSeries = mainChart.get(id);

      // Adding indicator series to the chart
      addTickerDatasetToSeries(targetSeries, indCreator);
    }
  }
}


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
  // console.log(ops);
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
        count: 14,
        text: '14d'
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
  let chartData = null;
  let mainChart = Highcharts.stockChart('hcharts-strategy', createHighChartsObj());
  // var mainChart = $('#hcharts-strategy').highcharts('StockChart', createHighChartsObj());
  // const chartData = null;
  // $('.progress').show();
  $('#chartButton').click(() => {
    $('.progress').show();
    const A = $('#baseCurrency').val();
    const B = $('#tradeCurrency').val();
    console.log(`Loading chart for ${A}_${B}...`);
    $.getJSON(`/data?currencyA=${A}&currencyB=${B}`, (data) => {
      console.log(data);
      const ops = {};
      ops.A = A; ops.B = B; ops.data = data; chartData = data;
      mainChart = Highcharts.stockChart('hcharts-strategy', createHighChartsObj(ops));
    });
  });
  $('#addIndicatorBtn_SMA').click(() => {
    console.log('### Inside addIndicator_SMA');

    const SMAParam = $('#addIndicator_SMA').val();
    csvToAddData(chartData, mainChart, SMAParam, 'SMA');

    // Redrawing chart after adding indicators
    mainChart.redraw();
  });
  $('#addIndicatorBtn_EMA').click(() => {
    console.log('### Inside addIndicator_EMA');

    const EMAParam = $('#addIndicator_EMA').val();
    csvToAddData(chartData, mainChart, EMAParam, 'EMA');

    // Redrawing chart after adding indicators
    mainChart.redraw();
  });
  $('#removeIndicator').click(() => {
    // PARAM see which indicator to add
    // PARAM what indicator parameter to use
    const indicator = 'blah';
    const indicParam = 23;
    console.log('hi');
    // console.log(indicator);
    // console.log(indicParam);
    // read time series data
    // create new indicator time series
    // add new time series to highcharts graph
    // redraw chart

  });

});
