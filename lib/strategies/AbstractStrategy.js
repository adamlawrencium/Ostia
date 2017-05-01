/*
Strategy takes in N things:
- Time series data
- Indicator timeseries

TODO: Strategy only executes upon strategy logic
*/


class AbstractStrategy {
  constructor(tickerData, indicators, strategyLogic) {
    this.tickerData = tickerData;
    this.indicators = indicators;
    this.strategyLogic = strategyLogic;
  }

  getTickerData() {

  }



}


exports.module = AbstractStrategy;
