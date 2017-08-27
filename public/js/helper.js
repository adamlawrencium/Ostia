const highchartsObj = {
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
};
