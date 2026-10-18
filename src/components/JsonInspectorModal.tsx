import { useState } from 'react';

interface JsonInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowData: object;
}

export function JsonInspectorModal({ isOpen, onClose, flowData }: JsonInspectorModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(flowData, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-flow-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Serialized Canvas JSON Payload</h2>
            <p className="modal-subtitle">
              Live representation of nodes, edges, positions, and finance domain data.
            </p>
          </div>
          <button type="button" className="drawer-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <pre className="json-viewer">
            <code>{jsonString}</code>
          </pre>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={handleCopy}>
            {copied ? '✓ Copied to Clipboard!' : 'Copy JSON'}
          </button>
          <button type="button" className="btn-primary" onClick={handleDownload}>
            Download .json
          </button>
        </div>
      </div>
    </div>
  );
}
