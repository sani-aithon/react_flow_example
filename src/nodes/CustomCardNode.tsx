import { useState } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

export type CustomCardNodeData = {
  title: string;
  description: string;
  initialCount?: number;
};

export type CustomCardNodeType = Node<CustomCardNodeData, 'customCard'>;

export function CustomCardNode({ data }: NodeProps<CustomCardNodeType>) {
  const [count, setCount] = useState(data.initialCount ?? 0);

  return (
    <div className="custom-card-node">
      {/* Target handle: where incoming edges connect */}
      <Handle
        type="target"
        position={Position.Top}
        className="handle-target"
      />

      <div className="card-header">
        <span className="badge">Custom Node</span>
        <h3>{data.title}</h3>
      </div>

      {/* <input/> */}

      <div className="card-body">
        <p>{data.description}</p>
        <div className="card-action">
          <span>Counter: {count}</span>
          <button
            type="button"
            className="nodrag" /* "nodrag" class prevents dragging node when clicking button */
            onClick={() => setCount((c) => c + 1)}
          >
            +1
          </button>
        </div>
      </div>

      <div className="card-footer">
        <span className="handle-label left">Out A</span>
        <span className="handle-label right">Out B</span>
      </div>

      {/* Multiple source handles: each must have a unique `id` */}
      <Handle
        id="source-a"
        type="source"
        position={Position.Bottom}
        style={{ left: '30%' }}
        className="handle-source handle-source-a"
      />
      <Handle
        id="source-b"
        type="source"
        position={Position.Bottom}
        style={{ left: '70%' }}
        className="handle-source handle-source-b"
      />
    </div>
  );
}
