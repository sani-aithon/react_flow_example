import type { Node, Edge } from '@xyflow/react';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR';

export type TransactionStatus = 'PENDING' | 'APPROVED' | 'HELD' | 'REJECTED';

export type FinancialTransactionData = {
  invoiceNumber: string;
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  counterparty: string;
  department?: string;
  notes?: string;
  onEditRequested?: (nodeId: string) => void;
};

export type FinancialNode = Node<FinancialTransactionData, 'financialTransaction'>;

export type FinancialFlowConfig = {
  version: string;
  flowName: string;
  nodes: FinancialNode[];
  edges: Edge[];
  viewport?: { x: number; y: number; zoom: number };
};
