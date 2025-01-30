import React, { useState, useEffect } from "react";
import { Graph } from "@visx/network";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

// -- (1) 그래프 초기화(원형 배치 + 랜덤 에지)
const RADIUS = 150;
const CENTER_X = 200;
const CENTER_Y = 200;
function makeCircleNodes(n) {
  const nodes = [];
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n;
    const x = CENTER_X + RADIUS * Math.cos(angle);
    const y = CENTER_Y + RADIUS * Math.sin(angle);
    nodes.push({ id: i, x, y });
  }
  return nodes;
}

function makeRandomLinks(nodes, p = 0.3) {
  const links = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() < p) {
        links.push({ source: nodes[i], target: nodes[j] });
      }
    }
  }
  return links;
}

// -- (2) 유틸: 그래프에서 특정 노드의 차수(degree) 구하기
function getDegree(graph, nodeId) {
  return graph.links.filter(
    (l) => l.source.id === nodeId || l.target.id === nodeId
  ).length;
}

// -- (3) 유틸: 어떤 노드의 이웃 목록 구하기
function getNeighbors(graph, nodeId) {
  const neighbors = [];
  graph.links.forEach((l) => {
    if (l.source.id === nodeId) {
      neighbors.push(l.target.id);
    } else if (l.target.id === nodeId) {
      neighbors.push(l.source.id);
    }
  });
  return [...new Set(neighbors)]; // 중복 제거
}

// -- (4) 유틸: 그래프에서 “이미 있는 에지”와 “없는 에지”를 분류하기
function classifyEdges(graph, partitionA, partitionB) {
  const haveEdge = [];
  const noEdge = [];

  // A == B인 경우 -> A 내부의 에지를 확인
  if (partitionA === partitionB) {
    for (let i = 0; i < partitionA.length; i++) {
      for (let j = i + 1; j < partitionA.length; j++) {
        const v1 = partitionA[i];
        const v2 = partitionA[j];
        const edgeExists = graph.links.some(
          (l) =>
            (l.source.id === v1 && l.target.id === v2) ||
            (l.source.id === v2 && l.target.id === v1)
        );
        edgeExists ? haveEdge.push([v1, v2]) : noEdge.push([v1, v2]);
      }
    }
  } else {
    // A != B인 경우 -> A-B 간 에지
    for (let v1 of partitionA) {
      for (let v2 of partitionB) {
        const edgeExists = graph.links.some(
          (l) =>
            (l.source.id === v1 && l.target.id === v2) ||
            (l.source.id === v2 && l.target.id === v1)
        );
        edgeExists ? haveEdge.push([v1, v2]) : noEdge.push([v1, v2]);
      }
    }
  }
  return { haveEdge, noEdge };
}

// -- (5) 메인 컴포넌트
export default function RunnerGameExample() {
  const [numVertices, setNumVertices] = useState(6);

  // original, previous, current 그래프 세트
  const [originalGraph, setOriginalGraph] = useState(null);
  const [previousGraph, setPreviousGraph] = useState(null);
  const [currentGraph, setCurrentGraph] = useState(null);

  // 러너의 현재 위치, 이전 위치
  const [runnerPos, setRunnerPos] = useState(null);
  const [runnerPosPrev, setRunnerPosPrev] = useState(null);

  // partition 3개 입력 (문자열로 관리) -> "0,1" 형태
  const [partitions, setPartitions] = useState(["", "", ""]);

  // 사용자에게 "어느 두 파티션을 flip할지" 고르게 하기
  const [selectedP1, setSelectedP1] = useState(0);
  const [selectedP2, setSelectedP2] = useState(1);

  // 승리 여부
  const [winner, setWinner] = useState(false);

  // 초기 그래프 + 러너 위치를 설정
  useEffect(() => {
    initGame(numVertices);
  }, [numVertices]);

  function initGame(n) {
    const nodes = makeCircleNodes(n);
    const links = makeRandomLinks(nodes, 0.5); // 50% 확률
    const newGraph = { nodes, links };

    // original/previous/current 모두 동일하게 시작
    setOriginalGraph(structuredClone(newGraph));
    setPreviousGraph(structuredClone(newGraph));
    setCurrentGraph(structuredClone(newGraph));

    // 러너 위치: 랜덤
    const startPos = Math.floor(Math.random() * n);
    setRunnerPos(startPos);
    setRunnerPosPrev(startPos);

    setPartitions(["", "", ""]);
    setWinner(false);

    setSelectedP1(0);
    setSelectedP2(1);
  }

  // 파티션 입력창 변화
  function handlePartitionChange(index, value) {
    const newParts = [...partitions];
    newParts[index] = value;
    setPartitions(newParts);
  }

  // 실제 FlipEdges 실행
  function flipEdges(pIndex1, pIndex2) {
    if (!currentGraph) return;
    if (pIndex1 === pIndex2) {
      alert("서로 다른 두 파티션을 선택하세요!");
      return;
    }

    // 파티션 문자열 -> 숫자 배열
    const partitionA = partitions[pIndex1]
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((x) => !isNaN(x));
    const partitionB = partitions[pIndex2]
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((x) => !isNaN(x));

    // classify
    const { haveEdge, noEdge } = classifyEdges(currentGraph, partitionA, partitionB);

    // 링크 배열 수정
    let newLinks = currentGraph.links.filter((l) => {
      const s = l.source.id;
      const t = l.target.id;
      // haveEdge에 속하는 에지는 제거
      return !haveEdge.some(
        ([v1, v2]) =>
          (v1 === s && v2 === t) || (v1 === t && v2 === s)
      );
    });
    // noEdge 추가
    noEdge.forEach(([v1, v2]) => {
      const sourceNode = currentGraph.nodes.find((n) => n.id === v1);
      const targetNode = currentGraph.nodes.find((n) => n.id === v2);
      if (sourceNode && targetNode) {
        newLinks.push({ source: sourceNode, target: targetNode });
      }
    });

    // currentGraph 갱신
    const updatedGraph = { nodes: currentGraph.nodes, links: newLinks };
    setCurrentGraph(updatedGraph);
  }

  // 러너 이동
  function moveRunner() {
    if (!previousGraph || !currentGraph || runnerPosPrev == null) return;

    // (이전 그래프에서) runnerPosPrev의 이웃
    const neighbors = getNeighbors(previousGraph, runnerPosPrev);

    // 그 중 (현재 그래프에서) 차수가 가장 큰 곳으로 이동
    let maxDegree = -1;
    let maxNeighbor = runnerPosPrev;
    neighbors.forEach((nbr) => {
      const deg = getDegree(currentGraph, nbr);
      if (deg > maxDegree) {
        maxDegree = deg;
        maxNeighbor = nbr;
      }
    });
    setRunnerPos(maxNeighbor);
  }

  // 고립 여부 체크
  function checkIsolation() {
    if (!currentGraph || runnerPos == null) return;
    const deg = getDegree(currentGraph, runnerPos);
    if (deg === 0) {
      setWinner(true);
    }
  }

  // "Done Flipping" 버튼: 
  // => move runner => check isolation => (고립X면) previousGraph 갱신 => currentGraph를 original로 되돌림
  function doneFlipping() {
    // 러너 이동
    moveRunner();

    // state 변경 후 비동기로 처리될 수 있으므로 setTimeout 등으로 순서를 맞춥니다.
    setTimeout(() => {
      checkIsolation();
      if (!winner) {
        // 고립되지 않았다면 => 다음 턴 준비
        if (currentGraph) {
          const copyGraph = structuredClone(currentGraph);
          setPreviousGraph(copyGraph);
          setRunnerPosPrev(runnerPos);
        }
        if (originalGraph) {
          setCurrentGraph(structuredClone(originalGraph));
        }
      }
    }, 0);
  }

  // JSX 렌더
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Flipper-RunnerGame</h1>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Number of Vertices:
          <input
            type="number"
            min={3}
            value={numVertices}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              // 3보다 작으면 3으로 고정
              if (val < 3) {
                setNumVertices(3);
              } else {
                setNumVertices(val);
              }
            }}
            style={{ marginLeft: 8 }}
          />
        </label>
      </div>

      {/* 파티션 3개 입력 */}
      <div style={{ marginBottom: "1rem" }}>
        <h3>Partitions</h3>
        {partitions.map((part, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Partition ${i + 1}, e.g. 0,1`}
            value={part}
            onChange={(e) => handlePartitionChange(i, e.target.value)}
            style={{ marginRight: 8 }}
          />
        ))}
      </div>

      {/* 파티션 선택해서 Flip */}
      <div style={{ marginBottom: "1rem" }}>
        <span>Select two partitions to flip edges: </span>
        <select
          value={selectedP1}
          onChange={(e) => setSelectedP1(parseInt(e.target.value))}
          style={{ marginRight: 8 }}
        >
          <option value={0}>Partition 1</option>
          <option value={1}>Partition 2</option>
          <option value={2}>Partition 3</option>
        </select>

        <select
          value={selectedP2}
          onChange={(e) => setSelectedP2(parseInt(e.target.value))}
          style={{ marginRight: 8 }}
        >
          <option value={0}>Partition 1</option>
          <option value={1}>Partition 2</option>
          <option value={2}>Partition 3</option>
        </select>

        <button onClick={() => flipEdges(selectedP1, selectedP2)}>
          Flip Edges
        </button>
      </div>

      {/* Done Flipping => move runner => check isolation => reset current */}
      <button onClick={doneFlipping} disabled={winner}>
        Done Flipping (Move Runner)
      </button>

      {winner && <h2 style={{ color: "#6363f7", marginTop: 10 }}>Runner is isolated. YOU WIN!</h2>}

      {/* 그래프 3개( original, previous, current ) */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px", height: "450px" }}>
        {/* G_0 (Original) */}
        <GraphView
          title={<span>
            Original Graph <InlineMath>{"G_0"}</InlineMath>
          </span>}
          graph={originalGraph}
          runnerPos={null} // G0에는 러너 표시 X (원하시면 표시 가능)
        />

        {/* G_{i-1} (Previous) */}
        <GraphView
          title={<span>
            Previous Graph <InlineMath>{"G_{i-1}"}</InlineMath>
          </span>}
          graph={previousGraph}
          runnerPos={runnerPosPrev}
        />

        {/* G_i (Current) */}
        <GraphView
          title={ <span>
            Current Graph <InlineMath>{"G_i"}</InlineMath>
          </span>}
          graph={currentGraph}
          runnerPos={runnerPos}
        />
      </div>
    </div>
  );
}

// -- (6) 그래프를 그리는 서브 컴포넌트
function GraphView({ title, graph, runnerPos }) {
  if (!graph) {
    return (
      <div style={{ width: 400, height: 470.5, border: "1px solid black" }}>
        <h4>{title}</h4>
        <p>Loading...</p>
      </div>
    );
  }

  const width = 400;
  const height = 400;

  return (
    <div style={{ width, height: 470.5, border: "1px solid black"}}>
      <h4>{title}</h4>
      <svg width={width} height={height}>
        <rect width={width} height={height} fill="#ffffff" />
        <Graph
          graph={graph}
          linkComponent={({ link }) => (
            <line
              x1={link.source.x}
              y1={link.source.y}
              x2={link.target.x}
              y2={link.target.y}
              strokeWidth={2}
              stroke="#999"
            />
          )}
          nodeComponent={({ node }) => {
            const isRunner = runnerPos === node.id;
            return (
              <g>
                <circle
                  fill={isRunner ? "red" : "skyblue"}
                  stroke="black"
                  r={isRunner ? 16 : 14}
                />
                <text
                  x={-4}
                  y={4}
                  style={{ fontSize: "11px", fill: "black", pointerEvents: "none" }}
                >
                  {node.id}
                </text>
              </g>
            );
          }}
        />
      </svg>
    </div>
  );
}