import React, { useState, useEffect } from "react";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import axios from "axios";

const GraphComponent = ({ numVertices }) => {
    const [graphHtml, setGraphHtml] = useState({ original: "", previous: "", current: "" });
    const [partitions, setPartitions] = useState(["", "", ""]);
    const [selectedPartitions, setSelectedPartitions] = useState(["", ""]);
    const [validPartitions, setValidPartitions] = useState(false);

    useEffect(() => {
        fetchGraphHtml();
    }, []);

    useEffect(() => {
        const fetchGraphHtml = async () => {
          try {
            const [originalGraph, previousGraph, currentGraph] = await Promise.all([
              fetch("http://127.0.0.1:5000/graph_html/original").then((res) =>
                res.text()
              ),
              fetch("http://127.0.0.1:5000/graph_html/previous").then((res) =>
                res.text()
              ),
              fetch("http://127.0.0.1:5000/graph_html/current").then((res) =>
                res.text()
              ),
            ]);
            setGraphHtml({
              original: originalGraph,
              previous: previousGraph,
              current: currentGraph,
            });
          } catch (error) {
            console.error("Error fetching graphs:", error);
          }
        };
    
        fetchGraphHtml();
      }, []); // 빈 배열 => 최초 1회만 실행
    
      // ✅ (2) graphHtml이 바뀔 때마다 mpld3 스크립트 재실행
      useEffect(() => {
        // (2-1) 일단 이전에 그려진 그래프(같은 class 또는 id)를 제거
        //       꼭 remove()할 필요가 없다면, 매번 .innerHTML로 새로 갈아끼우는 방식도 가능
        document.querySelectorAll(".mpld3-figure").forEach((el) => el.remove());
    
        // (2-2) setTimeout으로 살짝 지연 후, script 재삽입
        const timer = setTimeout(() => {
          console.log("🔄 Running mpld3 scripts...");
          // 기존 script들 일괄 재생성 (이 방법 대신, innerHTML만 교체하는 방법도 가능)
          const scriptTags = document.querySelectorAll("script");
          scriptTags.forEach((oldScript) => {
            const newScript = document.createElement("script");
            newScript.text = oldScript.text;
            oldScript.replaceWith(newScript);
          });
    
          // (2-3) mpld3.draw_all() 실행
          if (window.mpld3) {
            console.log("✅ mpld3 draw_all executed.");
            window.mpld3.draw_all();
          }
        }, 300);
    
        return () => clearTimeout(timer); // 컴포넌트 unmount 시 정리
      }, [graphHtml]); // graphHtml이 변할 때만 실행

    const fetchGraphHtml = async () => {
        try {
            const originalGraph = await fetch("http://127.0.0.1:5000/graph_html/original").then(res => res.text());
            const previousGraph = await fetch("http://127.0.0.1:5000/graph_html/previous").then(res => res.text());
            const currentGraph = await fetch("http://127.0.0.1:5000/graph_html/current").then(res => res.text());

            setGraphHtml({ original: originalGraph, previous: previousGraph, current: currentGraph });
        } catch (error) {
            console.error("Error fetching graphs:", error);
        }
    };

    const validatePartitions = () => {
        const allNumbers = partitions.flatMap(p => p.split(",").map(v => v.trim()));
        const uniqueNumbers = new Set(allNumbers);
        setValidPartitions(allNumbers.length === uniqueNumbers.size && allNumbers.every(v => !isNaN(v)));
    };

    const flipEdges = async () => {
        try {
            await axios.post("http://127.0.0.1:5000/flip_edges", {
                partition_a: partitions[selectedPartitions[0]].split(",").map(Number),
                partition_b: partitions[selectedPartitions[1]].split(",").map(Number),
            });
            fetchGraphHtml();
        } catch (error) {
            console.error("Error flipping edges:", error);
        }
    };

    const moveRunner = async () => {
        try {
            await axios.post("http://127.0.0.1:5000/move_runner");
            fetchGraphHtml();
        } catch (error) {
            console.error("Error moving runner:", error);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <h2>Runner Game (mpld3 View)</h2>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>
                {[
                    { text: "Original Graph", latex: "G_0" },
                    { text: "Previous Graph", latex: "G_{i-1}" },
                    { text: "Current Graph", latex: "G_i" }
                ].map((item, index) => (
                    <div key={index} style={{ textAlign: "center", border: "2px solid black", padding: "10px", borderRadius: "10px" }}>
                        <h3>
                            {item.text} <InlineMath>{item.latex}</InlineMath>
                        </h3>
                        <div
                            className="graph-container"
                            dangerouslySetInnerHTML={{
                                __html: index === 0 ? graphHtml.original : index === 1 ? graphHtml.previous : graphHtml.current
                            }}
                            style={{
                                width: "100%",
                                height: "100%",
                                overflow: "hidden",
                                padding: "0px",
                                margin: "0px",
                                clipPath: "inset(3.5% 4% 0% 0%)"
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* 파티션 입력 */}
            <div style={{ marginTop: "20px" }}>
                <h3>Partition the vertices into 3 groups:</h3>
                {partitions.map((partition, index) => (
                    <input
                        key={index}
                        type="text"
                        placeholder={`Partition ${index + 1} (comma-separated)`}
                        value={partition}
                        onChange={(e) => {
                            const newPartitions = [...partitions];
                            newPartitions[index] = e.target.value;
                            setPartitions(newPartitions);
                            validatePartitions();
                        }}
                    />
                ))}
            </div>

            {/* 파티션 검증 후 플립 UI */}
            {validPartitions && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Choose two partitions to flip edges:</h3>
                    {Array.from({ length: 2 }).map((_, i) => (
                        <select
                            key={i}
                            onChange={(e) => {
                                const newSelections = [...selectedPartitions];
                                newSelections[i] = e.target.value;
                                setSelectedPartitions(newSelections);
                            }}
                        >
                            <option value="">Select Partition</option>
                            <option value="0">Partition 1</option>
                            <option value="1">Partition 2</option>
                            <option value="2">Partition 3</option>
                        </select>
                    ))}
                    <button onClick={flipEdges} disabled={selectedPartitions.includes("")}>Flip Edges</button>
                </div>
            )}

            {/* 러너 이동 버튼 */}
            <button onClick={moveRunner} style={{ marginTop: "20px" }}>Move Runner</button>
        </div>
    );
};

export default GraphComponent;