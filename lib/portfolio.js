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
      console.log('\nAdding new position...');
      var position = {
        currencyPair: currencyPair,
        quantity: quantity,
        timestamp: [timestamp]
      };
      console.log('NOW');
      this.printAllPositions();
      this.positions[currencyPair] = position;
      this.positions[currencyPair].positionLog = [];
      console.log('New position added:');
      console.log(this);
      console.log();
    }
  }

  /**
   * Adds new position to Portfolio
   * @param {string} currencyPair reference
   * @param {int} quantity amount of currency to add to position
   * @param {int} timestamp unix time
   */
  addNewPosition2(order) {
    console.log('Adding new position...');
    this.positions[order.currencyPair] = order;
    this.positions[order.currencyPair].positionLog = [];
  }


  /**
   * Modifies an existing position, if position doesn't exist, add new one.
   * @param {string} currencyPair reference
   * @param {int} quantity amount of currency to add to position
   * @param {int} timestamp unix time
   */
  modifiyPosition(currencyPair, quantity, timestamp) {
    console.log('EFFORTS',exports.candlestickData);
    console.log('--modifiyPosition');
    if (currencyPair != undefined && quantity != undefined && timestamp != undefined) {
      if (currencyPair in this.positions) {
        console.log('## mod',currencyPair, quantity, timestamp);
        this.positions[currencyPair].quantity += quantity;
        //this.positions[currencyPair].timestamp.push(timestamp);
        this.logPosition();
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

  /**
   * Modifies an existing position, if position doesn't exist, add new one.
   * @param {string} currencyPair reference
   * @param {int} quantity amount of currency to add to position
   * @param {int} timestamp unix time
   */
  modifiyPosition2(order, marketData) {
    var pair = order.currencyPair;
    var quantity = order.quantity;
    var timestamp = order.timestamp;

    console.log('\nModifying Position...');

    console.log('Order:\n', order);

    if (pair in this.positions) {
      var currentPosition = this.positions[pair];
      currentPosition.quantity += quantity;
      this.logPosition(order);
      this.updatePortfolioValue2(order, marketData);
    }
    else {
      this.addNewPosition2(order);
      this.logPosition(order);
      this.updatePortfolioValue2(order, marketData);
    }
  }

  logPosition(position) {
    console.log(this);
    //console.log(this.positions[position.currencyPair]);
    this.positions[position.currencyPair].positionLog.push(position);
  }

  // /** TODO
  //  * Sells all currency of current pair.
  //  * @param {string} currencyPair reference
  //  * @param {int} quantity amount of currency to add to position
  //  * @param {int} timestamp unix time
  //  */
  // exitPosition(currencyPair) {
  //
  // }

  // /* Getters */
  // getAllPositions() {
  //
  // }
  printPortfolio() {
    console.log('\n-----------PORTFOLIO------------');
    console.log(this);
    console.log('---------------------------------\n');
  }

  calculateHistoricalPerformance(candlestickData, currencyPair, metric) {
    var backtest = [];
    // [timestamp, portfolioValue]

    // This function runs through the positionLog and calculates the portfolio
    // value at every time step.

    var numPositions = this.positions[currencyPair].positionLog.length;
    var positionLog = this.positions[currencyPair].positionLog;


    console.log(numPositions);

    var currentPortfolioValue = 0;
    for (var i = 0; i < candlestickData.length; i++) {
      var positionLog = this.positions[currencyPair].positionLog;
      for (var j = 0; j < numPositions; j++) {
        if (candlestickData[i].date == positionLog[j].timestamp) {
          console.log('found trade thing');
          currentPortfolioValue = positionLog[j].quantity * candlestickData[i].close;
          console.log([candlestickData[i].date, currentPortfolioValue]);
          backtest.push([candlestickData[i].date, currentPortfolioValue]);
        }
        else {
          console.log('1');
          currentPortfolioValue = candlestickData[i].close *
          backtest.push([candlestickData[i].date, currentPortfolioValue]);
        }
      }
    }
    return backtest;
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
    var quantity = this.positions[currencyPair].quantity;
    this.positions[currencyPair].value =  quantity * price;
  }

  findTickIndexByTimestamp(candlestickData, timestamp) {
    if (timestamp != null) {
      for (var i = 0; i < candlestickData.length; i++) {
        if (candlestickData[i].date == timestamp) {
          return i;
        }
      }
      throw 'ERROR: cannot find tick', console.log(new Error().stack);;
    }
    else {
      throw 'ERROR: timestamp is null.', console.log(new Error().stack);
    }
  }

  /**
  Takes in current market price for a currencyPair. This updates the portfolio.
  */
  updatePortfolioValue2(order, marketData) {
    console.log('new order',order);
    var tickIndex = this.findTickIndexByTimestamp(marketData, order.timestamp);
    this.positions[order.currencyPair].value = order.quantity * marketData[tickIndex].close;
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
