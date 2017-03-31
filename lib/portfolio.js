class Portfolio {
  constructor() {
    this.positions = {};
    this.initialCash;
    this.totalPortfolioValue;
    this.closedPositions;
  }

  {
    BTCUSD: Quantity,
    ETHUSD: Quantity,
  }

  /* modifiers */
  function addNewPosition(currencyPair, quantity, timestamp) {
    var position = {
      currencyPair,
      quantity,
      timestamp
    };

  }
  function exitPosition(currencyPair) {

  }
  function modifiyPosition(currencyPair) {

  }

  /* getters */
  function getAllPositions() {

  }
  function getPosition(currencyPair) {

  }
  function getTotalPortfolioValue() {

  }
  function getTradeLogs() {

  }
  function getSharpe() {
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
