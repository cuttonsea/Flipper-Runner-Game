import networkx as nx
import matplotlib.pyplot as plt
import random

class RunnerGame:
    def __init__(self):
        # Initialize a graph with 6 vertices
        self.graph = nx.Graph()
        self.vertices = list(range(int(input("Insert a number of vertices you want to play? "))))  #N vertices labeled 0 to 5
        self.graph.add_nodes_from(self.vertices)
        self.runner_position = random.choice(self.vertices)10
        
        # Randomly connect vertices with edges
        self.initialize_edges()
        
        # Fix positions for the nodes
        self.fixed_positions = nx.circular_layout(self.graph)
        # self.fixed_positions = nx.spring_layout(self.graph, seed=42)  # Using a seed for reproducibility
        self.display_graph()

    def initialize_edges(self):
        # Add random edges between vertices
        for v1 in self.vertices:
            for v2 in self.vertices:
                if v1 < v2 and random.choice([True, False]):
                    self.graph.add_edge(v1, v2)

    def display_graph(self):
        # Visualize the graph with Runner position using fixed positions
        nx.draw(self.graph, pos=self.fixed_positions, with_labels=True, node_color='lightblue', 
                node_size=500, font_size=14)
        nx.draw_networkx_nodes(self.graph, pos=self.fixed_positions, nodelist=[self.runner_position], 
                               node_color='red', node_size=700)
        plt.show()

    def partition_and_flip(self):
        print("Please partition the vertices into three groups.")
        
        # Get user input for each partition
        partitions = []
        for i in range(3):
            partition_input = input(f"Enter vertices for Partition {i+1} as comma-separated values (e.g., 0,1): ")
            try:
                # Parse the input into a list of integers
                partition = [int(v.strip()) for v in partition_input.split(",") if v.strip().isdigit()]
                # Validate that each vertex is within the range and not duplicated
                if any(v not in self.vertices for v in partition):
                    print("Invalid vertices. Please enter vertices between 0 and 5.")
                    return self.partition_and_flip()  # Restart this step on invalid input
                partitions.append(partition)
            except ValueError:
                print("Invalid input format. Please enter integers separated by commas.")
                return self.partition_and_flip()

        # Ensure all vertices are uniquely partitioned
        all_vertices = [v for partition in partitions for v in partition]
        if len(all_vertices) != len(set(all_vertices)):
            print("Vertices should not be in more than one partition. Please try again.")
            return self.partition_and_flip()
        
        # Let player pick two partitions to flip
        flip_input = input("Choose two partitions to flip (e.g., 1,2): ")
        try:
            p1, p2 = [int(x.strip()) - 1 for x in flip_input.split(",")]
            if p1 not in range(3) or p2 not in range(3) or p1 == p2:
                print("Invalid partition choices. Please try again.")
                return self.partition_and_flip()
        except ValueError:
            print("Invalid input format. Please enter two partition numbers separated by a comma.")
            return self.partition_and_flip()
        
        # Flip edges between selected partitions
        partition_A, partition_B = partitions[p1], partitions[p2]
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
