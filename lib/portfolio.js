/*
Positions
  exchange
    currencypair
      :amount
    currencypair
      :amount
  exchange
    currencypair
      :amount
    currencypair
      :amount
* Metrics
    current total value
    summary view
    sharpe ratios
* Logs
    exchange
      list of trades
    exchange
      list of trades
*/

module.exports = class Portfolio {
  constructor() {
    this.positions = {};
    // this.initialCash;
    this.totalPortfolioValue;
    // this.closedPositions;
  }

  /*****************************|
  |********  Modifiers  ********|
  |*****************************/

  /**
   * Modifies an existing position, if position doesn't exist, add new one.
   * @param {string} currencyPair reference
   * @param {int} quantity amount of currency to add to position
   * @param {int} timestamp unix time
   */
  modifiyPosition(order, marketData) {
    // console.log('+++ Portfolio: modifying position...');
    var pair = order.currencyPair;
    var quantity = order.quantity;
    var timestamp = order.timestamp;

    //console.log(order);
    if (pair in this.positions) {
      var currentPosition = this.positions[pair];
      currentPosition.quantity += quantity;
      this.logPosition(order);
      this.updatePortfolioValue(order, marketData);
    }
    else {
      this.addNewPosition(order);
      this.logPosition(order);
    }
  }

  /**
   * Adds new position to Portfolio
   * @param {string} currencyPair reference
   * @param {int} quantity amount of currency to add to position
   * @param {int} timestamp unix time
   */
  addNewPosition(order) {
    this.positions[order.currencyPair] = order;
    this.positions[order.currencyPair].positionLog = [];
  }

  logPosition(position) {
    //console.log(position);
    //var position_ = jQuery.extend(true, {}, position);
    var cloneOfA = JSON.parse(JSON.stringify(position));
    this.positions[position.currencyPair].positionLog.push(cloneOfA);
  }


  /**
  Takes in current market price for a currencyPair. This updates the portfolio.
  */
  updatePortfolioValue(order, marketData) {
    var tickIndex = this.findTickIndexByTimestamp(marketData, order.timestamp);
    this.positions[order.currencyPair].value = order.quantity * marketData[tickIndex].close;
  }

  findTickIndexByTimestamp(tickerData, timestamp) {
    if (timestamp != null) {
      // console.log(tickerData);
      for (var i = 0; i < tickerData.length; i++) {
        if (tickerData[i].date == timestamp) {
          return i;
        }
      }
      throw 'ERROR: cannot find tick', console.log(new Error().stack);;
    }
    else {
      throw 'ERROR: timestamp is null.', console.log(new Error().stack);
    }
  }


  printPortfolio() {
    console.log('\n-----------PORTFOLIO------------');
    console.log(this);
    console.log('---------------------------------\n');
  }

  calculateHistoricalPerformance(tickerData, curA, curB, metric) {
    // Container for the portfolio value over time
    var backtest = [];
    var currencyPair = curA + curB;

    // Initializing starting amounts. curA is the base currency
    var curA = 1000;
    var curB = 0;

    // Pulling the positionLog from this.positions
    var numPositions = this.positions[currencyPair].positionLog.length;
    var positionLog = this.positions[currencyPair].positionLog;
    var currentPortfolioValue = 0;

    // Looping through curA-curB data, looking at each date-close pair
    for (var i = 0; i < tickerData.length; i++) {

      // Looping through every position
      for (var j = 0; j < numPositions; j++) {

        // If this is a date we need to execute a position, execute it
        if (tickerData[i].date == positionLog[j].timestamp) {

          // If BUY, use all curA to purchase curB, using current exchange rate
          if (positionLog[j].longShort == 'BUY') {
            curB = curA / tickerData[i].close;
            curA = 0;
          }
          // If SELL, use all curB to purchase curA, using current exchange rate
          else {
            // If we don't have any curB, that means we havent executed a BUY yet, so continue
            if (curB == 0) {
              continue;
            }
            curA = curB * tickerData[i].close;
            curB = 0;
          }

          // Pushing the portfolio value and timestamp after executing a position
          currentPortfolioValue = curA + curB * tickerData[i].close;
          backtest.push([tickerData[i].date, currentPortfolioValue]);
        }
        else {
          // Pushing the portfolio value and timestamp
          currentPortfolioValue = curA + curB * tickerData[i].close;
          backtest.push([tickerData[i].date, currentPortfolioValue]);
        }
      }
    }
    return backtest;
  }

  // This function calculates the benchmark performance of a initial investment in BTC
  calculateHistoricalBenchmark(tickerData, curA) {
    var benchmark = [];
    var curA = 1000 / tickerData[0].close;
    // Looping through data, looking at each date-close pair
    for (var i = 0; i < tickerData.length; i++) {
      benchmark.push([tickerData[i].date, curA * tickerData[i].close]);
    }
    return benchmark;
  }
}
