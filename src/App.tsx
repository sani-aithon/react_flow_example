import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  useReactFlow,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeMouseHandler,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './App.css';

import initialFlowData from './data/initialFlow.json';
import { FinancialTransactionNode } from './nodes/FinancialTransactionNode';
import { EditNodeDrawer } from './components/EditNodeDrawer';
import { JsonInspectorModal } from './components/JsonInspectorModal';
import type { FinancialNode, FinancialTransactionData } from './types/finance';

// Memoized nodeTypes object outside the component to prevent re-renders
const nodeTypes = {
  financialTransaction: FinancialTransactionNode,
};

function FlowCanvas() {
  const { updateNodeData, toObject, setNodes: setRfNodes, setEdges: setRfEdges } = useReactFlow();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [currentJsonPayload, setCurrentJsonPayload] = useState<object>({});

  const handleOpenDrawer = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setIsDrawerOpen(true);
  }, []);

  // Initialize nodes from JSON and attach callback for in-node "Edit Details" button
  const initializedNodes: FinancialNode[] = useMemo(() => {
    return (initialFlowData.nodes as FinancialNode[]).map((node) => ({
      ...node,
      data: {
        ...node.data,
        onEditRequested: (id: string) => handleOpenDrawer(id),
      },
    }));
  }, [handleOpenDrawer]);

  console.log(initializedNodes, 'initializedNodes');
  const [nodes, setNodes] = useState<FinancialNode[]>(initializedNodes);
  const [edges, setEdges] = useState<Edge[]>(initialFlowData.edges as Edge[]);

  const onNodesChange: OnNodesChange<FinancialNode> = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    []
  );

  const onNodeClick: NodeMouseHandler = useCallback( 
    (_, node) => {
      handleOpenDrawer(node.id);
    },
    [handleOpenDrawer]
  );

  // Save handler invoked by the slide-over drawer
  const handleSaveNodeData = useCallback(
    (nodeId: string, updatedData: Partial<FinancialTransactionData>) => {
      // 1. Update React Flow internal node data
      updateNodeData(nodeId, updatedData);

      // 2. Synchronize our React state
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                ...updatedData,
              },
            };
          }
          return n;
        })
      );
    },
    [updateNodeData]
  );

  // Open JSON Inspector modal showing the serialized canvas state
  const handleInspectJson = useCallback(() => {
    const serialized = toObject();
    setCurrentJsonPayload({
      flowName: initialFlowData.flowName,
      version: initialFlowData.version,
      ...serialized,
    });
    setIsJsonModalOpen(true);
  }, [toObject]);

  // Reset to original JSON configuration
  const handleResetFlow = useCallback(() => {
    const resetNodes = (initialFlowData.nodes as FinancialNode[]).map((node) => ({
      ...node,
      data: {
        ...node.data,
        onEditRequested: (id: string) => handleOpenDrawer(id),
      },
    }));
    setNodes(resetNodes);
    setEdges(initialFlowData.edges as Edge[]);
    setRfNodes(resetNodes);
    setRfEdges(initialFlowData.edges as Edge[]);
    setIsDrawerOpen(false);
  }, [handleOpenDrawer, setRfNodes, setRfEdges]);

  // Currently selected node object for the drawer
  const activeNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Metrics summary
  const totalAmount = useMemo(() => {
    return nodes.reduce((sum, n) => sum + (Number(n.data?.amount) || 0), 0);
  }, [nodes]);

  return (
    <div className="flow-container">
      {/* Top Header / Action Bar */}
      <header className="flow-header">
        <div className="header-title-section">
          <div className="title-row">
            <h1>{initialFlowData.flowName}</h1>
            <span className="version-pill">v{initialFlowData.version} (JSON-Driven)</span>
          </div>
          <p className="subtitle">
            Click any financial node or its edit button to modify data in the slide-over drawer.
          </p>
        </div>

        <div className="header-metrics">
          <div className="metric-item">
            <span className="metric-label">Nodes</span>
            <span className="metric-value">{nodes.length}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Total Flow Value</span>
            <span className="metric-value font-mono">
              ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={handleResetFlow}>
            Reset to Input JSON
          </button>
          <button type="button" className="btn-primary" onClick={handleInspectJson}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            Inspect Output JSON
          </button>
        </div>
      </header>

      {/* React Flow Canvas */}
      <div className="flow-canvas-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
        >
          <Background color="#cbd5e1" gap={20} size={1} />
          <Controls />
        </ReactFlow>
      </div>

      {/* Slide-over Side Drawer for editing financial node data */}
      <EditNodeDrawer
        node={activeNode}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveNodeData}
      />

      {/* Modal displaying live serialized JSON payload */}
      <JsonInspectorModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        flowData={currentJsonPayload}
      />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
