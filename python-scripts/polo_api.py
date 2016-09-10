from polo_api_wrapper import poloniex
import requests
import json
import networkx
import time


pricesotime = [0,]*100

for z in range(100):
    fee = .9975
    krakID = "XXBTZUSD"
    response3 = requests.get("https://api.kraken.com/0/public/Ticker", {"pair":krakID})
    tickerData3 = response3.json()


    cbID = "BTC-USD"
    response2 = requests.get("http://api.exchange.coinbase.com/products/"+cbID+"/ticker")
    tickerData2 = response2.json()

    response = requests.get("https://poloniex.com/public?command=returnTicker")
    tickerData = response.json()

    cba = float(tickerData2["ask"])
    cbb = float(tickerData2["bid"])
    pxa = float(tickerData["USDT_BTC"]["lowestAsk"])
    pxb = float(tickerData["USDT_BTC"]["highestBid"])
    kra = float(tickerData3["result"][krakID]['a'][0])
    krb = float(tickerData3["result"][krakID]['b'][0])

    asks = [cba,pxa,kra]
    bids = [cbb,pxb,krb]
    lowa = cba
    highb = 0

    for i in range(3):

        if (asks[i]<lowa):
            lowa = asks[i]
        if (bids[i]>highb):
            highb = bids[i]



    print "{0:.8f}%".format(((highb*.9975)-(lowa*.9975))/650)
    pricesotime[z] = (highb-lowa)/650
    time.sleep(5) # delays for 10 seconds

for z in range(100):
    print pricesotime[z]
    print

"""
    print 'cb ask:\t',tickerData2["ask"]
    print 'cb bid:\t',tickerData2["bid"]
    print
    print 'px ask:\t',tickerData["USDT_BTC"]["lowestAsk"]
    print 'px bid:\t',tickerData["USDT_BTC"]["highestBid"]
    print
    print 'kr ask:\t',tickerData3["result"][krakID]['a'][0]
    print 'kr bid:\t',tickerData3["result"][krakID]['b'][0]




    response = requests.get("https://poloniex.com/public?command=returnTicker")

    #print (response.content)["BTC_LTC"]

    #       -------------------------------------------------------------------
    #       -------------------------------------------------------------------
    #
    #       DETERMINE IF ARBITRAGE OPPORTUNITIES EXIST WITHIN POLONIEX EXCHANGE
    #       Using the Bellman-Ford algorithm, we can detect a negative cycle.
    #
    #       -------------------------------------------------------------------
    #       -------------------------------------------------------------------



    tickerData = response.json()

    print tickerData["BTC_ETH"]["highestBid"]
    print tickerData["BTC_ETH"]["lowestAsk"]

    print tickerData["USDT_BTC"]["highestBid"]
    print tickerData["USDT_BTC"]["lowestAsk"]

    print tickerData["BTC_XMR"]["highestBid"]
    print tickerData["BTC_XMR"]["lowestAsk"]

    print tickerData["USDT_XMR"]["highestBid"]
    print tickerData["USDT_XMR"]["lowestAsk"]

    print tickerData["USDT_ETH"]["highestBid"]
    print tickerData["USDT_ETH"]["lowestAsk"]







    BTC_ETH_highBid = float(tickerData["BTC_ETH"]["highestBid"])
    BTC_ETH_lowAsk = float( tickerData["BTC_ETH"]["lowestAsk"])

    USDT_BTC_highBid = float( tickerData["USDT_BTC"]["highestBid"])
    USDT_BTC_lowAsk = float( tickerData["USDT_BTC"]["lowestAsk"])

    BTC_XMR_highBid = float( tickerData["BTC_XMR"]["highestBid"])
    BTC_XMR_lowAsk = float( tickerData["BTC_XMR"]["lowestAsk"])

    USDT_XMR_highBid = float( tickerData["USDT_XMR"]["highestBid"])
    USDT_XMR_lowAsk = float( tickerData["USDT_XMR"]["lowestAsk"])

    USDT_ETH_highBid = float( tickerData["USDT_ETH"]["highestBid"])
    USDT_ETH_lowAsk = float( tickerData["USDT_ETH"]["lowestAsk"])

    startBTC = 1
    fee = .9975
    endBTC = ((startBTC*USDT_BTC_highBid*fee)/USDT_ETH_lowAsk)*BTC_ETH_highBid*(fee**2)
    endBTC2 = (((startBTC/BTC_ETH_lowAsk)*(fee**2)*USDT_ETH_highBid)/USDT_XMR_lowAsk)*BTC_XMR_highBid*(fee**2)


    print (endBTC-startBTC)*fee*USDT_BTC_highBid
    print
    print (endBTC2-startBTC)*fee*USDT_BTC_highBid
    print
    print
    print

"""

"""
print
print
print

print tickerData
print
# Get list of currencies
currencies = []
for pair in tickerData:
    pair = pair.split('_')
    curA, curB = pair[0], pair[1]
    currencies.append(curA)
    currencies.append(curB)

currencies = (list(set(currencies)))
print currencies

for pair in tickerData:
    print [pair]

adjlist = {}
for pair in tickerData:

    pair = pair.split('_')
    curA, curB = pair[0], pair[1]


    adjlist[curA] = (curB,tickerData[pair]["last"])
    adjlist[curA] = (curB,tickerData[pair]["last"])

    print tickerData[pair]["last"]

print adjlist

"""

#print tickerData["ETC_BTC"]


"""
#adjmatrix = [][]
for i in adjmatrix:
    for j in adjmatrix:
        # do stuff


{ BTC_ETC: }
"""






"""
SECRET = ""
APIKEY = "578VL4VN-4B6OMM8W-EO027CY7-Q4WW19UX"
Pol = poloniex(APIKEY,SECRET)
bal = Pol.returnBalances()

#print bal['BTC']
"""
"""
Next steps:

Create API Wrappers for:
[X] POLONIEX
[ ] KRAKEN
[ ] BITREX
[ ] ...
[ ] ...
[ ] ...

Get comparisons for different exchanges



"""

#print Pol.returnTicker()["USDT_XRP"]
