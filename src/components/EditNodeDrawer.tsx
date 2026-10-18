import { useState, useEffect } from 'react';
import type { Currency, FinancialNode, FinancialTransactionData, TransactionStatus } from '../types/finance';

interface EditNodeDrawerProps {
  node: FinancialNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, updatedData: Partial<FinancialTransactionData>) => void;
}

const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'INR'];
const statuses: TransactionStatus[] = ['PENDING', 'APPROVED', 'HELD', 'REJECTED'];

export function EditNodeDrawer({ node, isOpen, onClose, onSave }: EditNodeDrawerProps) {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [counterparty, setCounterparty] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('PENDING');
  const [department, setDepartment] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync form whenever selected node changes
  useEffect(() => {
    if (node) {
      setInvoiceNumber(node.data.invoiceNumber || '');
      setAmount(node.data.amount ?? '');
      setCurrency(node.data.currency || 'USD');
      setCounterparty(node.data.counterparty || '');
      setStatus(node.data.status || 'PENDING');
      setDepartment(node.data.department || '');
      setNotes(node.data.notes || '');
      setErrors({});
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!invoiceNumber.trim()) {
      errs.invoiceNumber = 'Invoice reference number is required.';
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Amount must be a positive number greater than 0.';
    }

    if (!counterparty.trim()) {
      errs.counterparty = 'Counterparty entity name is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave(node.id, {
      invoiceNumber: invoiceNumber.trim(),
      amount: Number(amount),
      currency,
      counterparty: counterparty.trim(),
      status,
      department: department.trim(),
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h2>Edit Financial Node</h2>
            <span className="drawer-subtitle">Node ID: {node.id}</span>
          </div>
          <button type="button" className="drawer-close-btn" onClick={onClose} aria-label="Close drawer">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="drawer-form">
          <div className="form-group">
            <label htmlFor="invoiceNumber">Invoice / Reference #</label>
            <input
              id="invoiceNumber"
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="e.g. INV-2024-001"
              className={errors.invoiceNumber ? 'input-error' : ''}
            />
            {errors.invoiceNumber && <span className="error-text">{errors.invoiceNumber}</span>}
          </div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={errors.amount ? 'input-error' : ''}
              />
              {errors.amount && <span className="error-text">{errors.amount}</span>}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="counterparty">Counterparty / Payee</label>
            <input
              id="counterparty"
              type="text"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              placeholder="e.g. Vendor Corp or Escrow Account"
              className={errors.counterparty ? 'input-error' : ''}
            />
            {errors.counterparty && <span className="error-text">{errors.counterparty}</span>}
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="status">Transaction Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TransactionStatus)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group flex-1">
              <label htmlFor="department">Department</label>
              <input
                id="department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Treasury"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Audit &amp; Compliance Notes</label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add justification or audit references..."
            />
          </div>

          <div className="drawer-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
