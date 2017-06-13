"""

IMPLEMENTATION OF graph TO DETERMINE ARBITRAGE OPPORTUNITIES VIA BELLMAN-FORD

Given pricing data for poloniex data, find arbitrage opportunities.

u'BTC_ETH': {
    u'last': u'0.01938904',
    u'quoteVolume': u'751935.44455731',
    u'high24hr': u'0.01998655',
    u'isFrozen': u'0',
    u'highestBid': u'0.01939181',
    u'percentChange': u'-0.00151710',
    u'low24hr': u'0.01896041',
    u'lowestAsk': u'0.01939861',
    u'id': 148,
    u'baseVolume': u'14596.47904223'
}


     *highestBid
BTC ------------> ETH

      /lowestAsk
ETH <------------ BTC


"""

import networkx as nx
import matplotlib.pyplot as plt
import math
import requests
import json



def getTickerData():
    response = requests.get("https://poloniex.com/public?command=returnTicker")
    tickerData = response.json()
    # print tickerData
    return tickerData



def createGraphFromData(tickerData):
    G = nx.Graph()

    for ticker in tickerData:

        pair = ticker.split('_')
        curA, curB = pair[0], pair[1]

        # math.log()
        lowestAsk = float(tickerData[ticker]['lowestAsk'])
        highestBid = float(tickerData[ticker]['highestBid'])

        G.add_edge(curA, curB, weight=lowestAsk)
        G.add_edge(curB, curA, weight=highestBid)

    # Clean up loner currencies
    for node in G.nodes():
        if len(G[node]) <= 1:
            G.remove_node(node)

    return G



def logEdges(G):

    # Bellman-Ford edge preparation \\ edge_weight = -log(edge_weight)
    for edge in G.edges(data=True):
        weight = edge[2]['weight']

        G_w = G[edge[0]][edge[1]]['weight']
        G[edge[0]][edge[1]]['weight'] = math.log(G_w)

        print 'weight:\t\t',weight
        print'new weight:\t', math.log(G_w)

    return G



def main():
    data = getTickerData()
    Graph = createGraphFromData(data)
    # Graph = logEdges(Graph)

    print nx.info(Graph)
    print "Negative cycle?:", nx.negative_edge_cycle(Graph)
    #print nx.bellman_ford(G,'BTC',weight='weight')

    pos = nx.circular_layout(Graph)
    print Graph
    nx.draw(Graph,pos)
    # use default edge labels
    nx.draw_networkx_edge_labels(Graph,pos)

    plt.show()

if __name__ == '__main__':
    main()
