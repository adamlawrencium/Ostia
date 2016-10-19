$( document ).ready(function() {
  $.getJSON('https://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function (data) {

    /*
    High Charts Notes

    data:   [ [x,y], [x,y], [x,y], ...]
    [ [time,price], [time,price], [time,price], ...]
    Use "Zones" for visual effect

    */
    $('#container').highcharts('StockChart', {

      rangeSelector: {
        selected: 1
      },

      title: {
        text: 'fasdfas Stock Price'
      },

      subtitle: {
        text: 'Live updates for BTC'
      },

      series: [{
        name: 'BANANA',
        data: data,
        tooltip: {
          valueDecimals: 2
        }
      }]
    });
  });
});
