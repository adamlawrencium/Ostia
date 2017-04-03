module.exports = class Portfolio {
  constructor() {
    this.positions = {};
    // this.initialCash;
    // this.totalPortfolioValue;
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
    }
  }

  /**
   * Modifies an existing position, if position doesn't exist, add new one.
   * @param {string} currencyPair reference
   * @param {int} quantity amount of currency to add to position
   * @param {int} timestamp unix time
   */
  modifiyPosition(currencyPair, quantity, timestamp) {
    if (currencyPair != undefined && quantity != undefined && timestamp != undefined) {

      if (currencyPair in this.positions) {
        this.positions[currencyPair].quantity += quantity;
        this.positions[currencyPair].timestamp.push(timestamp);
        console.log('PORTFOLIO: modifying position', currencyPair);
      } else {
        this.addNewPosition(currencyPair, quantity, timestamp);
        console.log('PORTFOLIO: added new position', currencyPair);
      }
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
  getTotalPortfolioValue() {

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
