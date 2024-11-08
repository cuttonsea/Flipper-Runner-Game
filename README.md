# Flipper-Runner-Game
Inspired by the Flip - width theory from the Graph Theory.

## Basic rule
There are two roles, **Flipper** and **Runner**.
For each turn, **flipper** gives k-partition on the vertex set of the initial graph $G_0$, and makes new graph $G_i$ by *flipping* bewteen two sets in the partition.
To *flip* between two set A, B is that for any vertices $v \in A$ and $w \in B$:
1. If there is an edge between $v$ and $w$, erase it.
2. If trere is no edge between $v$ and $w$, add it.
**Runner**, starting at the random vertex of $G_0$, runs along the edges of the graph $G_{i-1}$, knowing the flipped graph $G_i$.


You are the **Fliiper**.
**Flipper** wins if the **Runner** is isolated.

It is know that **Flipper** must win this game if the game lasts sufficiently long.
The Goal is to win **ASAP**.


## Step 1. Set a number of vertices of graph you want to play. (int)
The first display will give you the initial graph with random edges.

## Step 2. Give partition in three sets of the vertices.
Use the indices of vertices you have observed in the dispay shown.
Declare each set of partitions by splitting these indices by comma(,).

## Step 3. Pick two sets of the partition you want to *flip*.


