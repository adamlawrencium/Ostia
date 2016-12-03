// Function to parse the underlying maps in each exchange
function mapParse (exchangeData, exchangeType) {
  var highbids = exchangeData.highbids
  var lowasks = exchangeData.lowasks

  // Initializing temporary variables for sorting through the maps
  var tmpHighbid = 0
  var tmpLowask = 1000000000000000
  var tmpAmtHighbid = 0
  var tmpAmtLowask = 0

  // TODO parseFloat numbers when they are stored, not when now

  // Iterating through each entry in the map to find highest value
  highbids.forEach(function (value, key) {
    // GDAX or Bit
    if (exchangeType === 'gdax' || exchangeType === 'bitfinex') {
      if (value.rate > tmpHighbid) {
        tmpHighbid = value.rate
        tmpAmtHighbid = value.amount
      } else if (value.rate === tmpHighbid) {
        tmpAmtHighbid += value.amount
      }
    } else if (exchangeType === 'kraken' || exchangeType === 'poloniex') {
      // Kraken or Polo
      if (key > tmpHighbid) {
        tmpHighbid = key
        tmpAmtHighbid = value
      }
    }
  })

  // Iterating through each entry in the map to find smallest value
  lowasks.forEach(function (value, key) {
    // GDAX or Bit
    if (exchangeType === 'gdax' || exchangeType === 'bitfinex') {
      if (value.rate < tmpLowask) {
        tmpLowask = value.rate
        tmpAmtLowask = value.amount
      } else if (value.rate === tmpLowask) {
        tmpAmtLowask += value.amount
      }
    } else if (exchangeType === 'kraken' || exchangeType === 'poloniex') {
      // Kraken or Polo
      if (key < tmpLowask) {
        tmpLowask = key
        tmpAmtLowask = value
      }
    }
  })

  // Return summarized results
  return [tmpHighbid, tmpAmtHighbid, tmpLowask, tmpAmtLowask]
}

module.exports = mapParse
