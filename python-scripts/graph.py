"""

IMPLEMENTATION OF graph TO DETERMINE ARBITRAGE OPPORTUNITIES VIA BELLMAN-FORD

Given pricing data for poloniex data, find arbitrage opportunities.


write a script that someone can input and be able to output in tabular format.
then write a frontend around that
write api wrappers


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


A <-- B

"""

import networkx as nx
import matplotlib.pyplot as plt
import math
import requests
import json





def getTickerData():
    response = requests.get("https://poloniex.com/public?command=returnTicker")
    tickerData = response.json()
    print tickerData
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



def prepEdges(G):

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
    Graph = prepEdges(Graph)


    print nx.info(Graph)
    print(nx.negative_edge_cycle(Graph))
    #print nx.bellman_ford(G,'BTC',weight='weight')

    import pylab
    pos=nx.spring_layout(Graph)
    # version 1
    pylab.figure(1)
    nx.draw(Graph,pos)
    # use default edge labels
    nx.draw_networkx_edge_labels(Graph,pos)


    # show graphs
    pylab.show()

    pos = nx.spring_layout(Graph)
    nx.draw_networkx_edges(Graph,pos)
    plt.show()


if __name__ == '__main__':
    main()



""""""
