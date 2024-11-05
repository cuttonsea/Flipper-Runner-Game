import networkx as nx
import matplotlib.pyplot as plt
import random

class RunnerGame:
    def __init__(self):
        # Initialize a graph with 6 vertices
        self.graph = nx.Graph()
        self.vertices = list(range(6))  # 6 vertices labeled 0 to 5
        self.graph.add_nodes_from(self.vertices)
        self.runner_position = random.choice(self.vertices)
        
        # Randomly connect vertices with edges
        self.initialize_edges()
        self.display_graph()

    def initialize_edges(self):
        # Add random edges between vertices
        for v1 in self.vertices:
            for v2 in self.vertices:
                if v1 < v2 and random.choice([True, False]):
                    self.graph.add_edge(v1, v2)

    def display_graph(self):
        # Visualize the graph with Runner position
        pos = nx.spring_layout(self.graph)
        nx.draw(self.graph, pos, with_labels=True, node_color='lightblue', node_size=500, font_size=14)
        nx.draw_networkx_nodes(self.graph, pos, nodelist=[self.runner_position], node_color='red', node_size=700)
        plt.show()

    def partition_and_flip(self):
        # Get partitions from the player (simulating input here)
        partitions_in = input("give your partition. ex. 1,2,3/4,5/0 :: ")
        partitions = []
        i = 0
        #NEED SOME CODE FOR VALIDATION
        for partition in partitions_in.split("/"):
            vertex = partition.split(",")
            vertex = list(map(int, vertex))
            partitions.append(vertex)
            i += 1
        
        # Player places vertices into partitions (for simplicity, assume input here)
        # Example: partitions[0] = [0, 1], partitions[1] = [2, 3], partitions[2] = [4, 5]
        
        # Simulate a flip choice, picking two partitions (e.g., A and B)
        partition_A, partition_B = partitions[0], partitions[1]
        
        # Flip edges between partitions A and B
        for v1 in partition_A:
            for v2 in partition_B:
                if self.graph.has_edge(v1, v2):
                    self.graph.remove_edge(v1, v2)
                else:
                    self.graph.add_edge(v1, v2)
        
        self.display_graph()

    def move_runner(self):
        # Move Runner to a random connected vertex, if any
        neighbors = list(self.graph.neighbors(self.runner_position))
        if neighbors:
            self.runner_position = random.choice(neighbors)
            return True
        return False

    def play_game(self):
        # Main game loop
        while True:
            self.partition_and_flip()
            if not self.move_runner():
                print("Runner is isolated. You win!")
                break
            print(f"Runner moved to vertex {self.runner_position}")
            self.display_graph()

# Start the game
game = RunnerGame()
game.play_game()
