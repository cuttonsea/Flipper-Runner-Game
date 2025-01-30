import React, { useState } from "react";
import axios from "axios";

const FlipEdges = ({ onGraphUpdate }) => {
    const [partitionA, setPartitionA] = useState("");
    const [partitionB, setPartitionB] = useState("");

    const flipEdges = async () => {
        try {
            const response = await axios.post("http://127.0.0.1:5000/flip_edges", {
                partition_a: partitionA.split(",").map(Number),
                partition_b: partitionB.split(",").map(Number),
            });
            alert(response.data.message);
            onGraphUpdate();  // Refresh the graph
        } catch (error) {
            console.error("Error flipping edges:", error);
        }
    };

    return (
        <div>
            <h2>Flip Edges</h2>
            <input
                type="text"
                placeholder="Partition A (comma-separated)"
                value={partitionA}
                onChange={(e) => setPartitionA(e.target.value)}
            />
            <input
                type="text"
                placeholder="Partition B (comma-separated)"
                value={partitionB}
                onChange={(e) => setPartitionB(e.target.value)}
            />
            <button onClick={flipEdges}>Flip Edges</button>
        </div>
    );
};

export default FlipEdges;