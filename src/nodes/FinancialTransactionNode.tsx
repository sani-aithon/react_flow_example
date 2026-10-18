import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { FinancialNode, TransactionStatus } from '../types/finance';

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

const statusColors: Record<TransactionStatus, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  APPROVED: { bg: '#dcfce7', text: '#166534', dot: '#22c55e' },
  HELD: { bg: '#ffedd5', text: '#9a3412', dot: '#f97316' },
  REJECTED: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
};

function FinancialTransactionNodeComponent({ id, data, selected }: NodeProps<FinancialNode>) {
  const currentStatus = data.status || 'PENDING';
  const statusTheme = statusColors[currentStatus] || statusColors.PENDING;

  return (
    <div className={`finance-node ${selected ? 'is-selected' : ''}`}>
      {/* Target handle for incoming transactions */}
      <Handle
        type="target"
        position={Position.Top}
        className="finance-handle"
      />

      <div className="finance-node-header">
        <span className="invoice-tag">{data.invoiceNumber || 'TX-NEW'}</span>
        <span
          className="status-pill"
          style={{ backgroundColor: statusTheme.bg, color: statusTheme.text }}
        >
          <span className="status-dot" style={{ backgroundColor: statusTheme.dot }} />
          {currentStatus}
        </span>
      </div>

      <div className="finance-node-body">
        <div className="amount-display">
          {formatCurrency(data.amount, data.currency)}
        </div>
        <div className="counterparty-name" title={data.counterparty}>
          {data.counterparty || 'Unnamed Counterparty'}
        </div>
        {data.department && (
          <div className="department-tag">{data.department}</div>
        )}
      </div>

      <div className="finance-node-footer">
        <button
          type="button"
          className="nodrag edit-button"
          onClick={(e) => {
            e.stopPropagation();
            data.onEditRequested?.(id);
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Details
        </button>
      </div>

      {/* Source handle for outgoing / dependent transactions */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="finance-handle"
      />
    </div>
  );
}

export const FinancialTransactionNode = memo(FinancialTransactionNodeComponent);
