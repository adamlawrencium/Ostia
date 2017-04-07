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
   * Adds new position to Portfolio
   * @param {string} currencyPair reference
   * @param {int} quantity amount of currency to add to position
   * @param {int} timestamp unix time
   */
  addNewPosition(currencyPair, quantity, timestamp) {
    if (!(currencyPair in this.positions) && quantity != undefined && timestamp != undefined) {
      var position = {
        currencyPair: currencyPair,
        quantity: quantity,
        timestamp: [timestamp]
      };
      console.log('NOW');
      this.printAllPositions();
      this.positions[currencyPair] = position;
      this.positions[currencyPair].positionLog = [];
    }
  }

  /**
   * Modifies an existing position, if position doesn't exist, add new one.
   * @param {string} currencyPair reference
   * @param {int} quantity amount of currency to add to position
   * @param {int} timestamp unix time
   */
  modifiyPosition(currencyPair, quantity, timestamp) {
    console.log('--modifiyPosition');
    if (currencyPair != undefined && quantity != undefined && timestamp != undefined) {
      if (currencyPair in this.positions) {
        console.log('## mod',currencyPair, quantity, timestamp);
        this.positions[currencyPair].quantity += quantity;
        this.positions[currencyPair].timestamp.push(timestamp);
        this.positions[currencyPair].positionLog.push(Object.assign({}, this.positions[currencyPair]));
        console.log('PORTFOLIO: modifying position', currencyPair);
      } else {
        this.addNewPosition(currencyPair, quantity, timestamp);
        console.log('PORTFOLIO: added new position', currencyPair);
      }
      //this.updatePortfolioValue
    }
    else {
      console.log('\n### ERROR\ncurrencyPair:' ,currencyPair);
      console.log('quantity:', quantity);
      console.log('timestamp:', timestamp);
      throw 'ERROR: at least one argument is undefined.', console.log(new Error().stack);
    }
  }


  /** TODO
   * Sells all currency of current pair.
   * @param {string} currencyPair reference
   * @param {int} quantity amount of currency to add to position
   * @param {int} timestamp unix time
   */
  exitPosition(currencyPair) {

  }

  /* Getters */
  getAllPositions() {

  }
  printAllPositions() {
    console.log('\n----PORTFOLIO----');
    console.log(this);
  }
  getPosition(currencyPair) {

  }

  calculateHistoricalPerformance(candlestickData, currencyPair, metric) {
    var backtest = [];
    // [timestamp, portfolioValue]

    for (var i = 0; i < candlestickData.length; i++) {
      // if trade was made, recalculate portfolioValue
      if (candlestickData[i].close in this.portfolio[currencyPair].timestamp)
      backtest.push([candlestickData[i].close, 9]);
    }


  }
  printHistoricalPerformance(currencyPair, metric) {
    if (metric == 'PnL') {
      for (var i = 0; i < this.positions[currencyPair].positionLog.length; i++) {
        var valueAtTime = this.positions[currencyPair].positionLog[i].timestamp[i];
        var portfolioValue = this.positions[currencyPair].positionLog[i].value;
        console.log('Time:',valueAtTime,'|', 'Value:', portfolioValue);
      }
    }
    else {
      console.log('no metric availble for', metric);
    }
  }

  printPositionLog(currencyPair) {
    console.log('Past Positions:');
    for (var i = 0; i < this.positions[currencyPair].positionLog.length; i++) {
      console.log(this.positions[currencyPair].positionLog[i]);
    }
  }

  /**
  Takes in current market price for a currencyPair. This updates the portfolio.
  */
  updatePortfolioValue(currencyPair, price) {
    console.log('--updatePortfolioValue');
    console.log('##', this);
    var quantity = this.positions[currencyPair].quantity;
    this.positions[currencyPair].value =  quantity * price;
  }

  /**
   * Calculates current portfolio value by multiplying quantity of currency
   * by price of currency.
   * @param {object} marketPriceData An object that contains market data for
   * each currency. {currencyA: price, currencyB: price, ...}
   */
  getTotalPortfolioValue(marketPriceData) {

  }
  getTradeLogs() {

  }
  getSharpe() {
    // other desired metrics
  }
}

/*
Class structure

Portfolio --> positions -->

Portfolio


* Positions
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
