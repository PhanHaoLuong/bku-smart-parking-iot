import express from 'express';
import { requireRole } from '../middlewares/roleMiddleware.js';
import {
  handleGetAllPolicies,
  handleGetPolicyById,
  handleCreatePolicy,
  handleUpdatePolicy,
  handleDeactivatePolicy,
  handleListInvoices,
  handleGetInvoiceById,
  handleGenerateInvoices,
  handleMarkInvoicePaid,
  handleGetOutstandingList,
  handleListVisitorTransactions,
  handleGetVisitorRevenue,
  handleMarkVisitorPaid,
  handleGetRevenueSummary,
  handleGetAuditLog,
} from '../controllers/billing.controller.js';

const router = express.Router();

// ─── Pricing Policies (finance/admin only) ─────────────────────────────
router.get('/policies', requireRole('finance', 'admin'), handleGetAllPolicies);
router.get('/policies/:id', requireRole('finance', 'admin'), handleGetPolicyById);
router.post('/policies', requireRole('finance', 'admin'), handleCreatePolicy);
router.put('/policies/:id', requireRole('finance', 'admin'), handleUpdatePolicy);
router.delete('/policies/:id', requireRole('finance', 'admin'), handleDeactivatePolicy);

// ─── Invoices ──────────────────────────────────────────────────────────
router.get('/invoices', requireRole('finance', 'admin', 'learner', 'faculty'), handleListInvoices);
router.get('/invoices/:id', requireRole('finance', 'admin', 'learner', 'faculty'), handleGetInvoiceById);
router.post('/invoices/generate', requireRole('finance', 'admin'), handleGenerateInvoices);
router.put('/invoices/:id/pay', requireRole('finance', 'admin', 'learner', 'faculty'), handleMarkInvoicePaid);
router.get('/invoices/outstanding/list', requireRole('finance', 'admin'), handleGetOutstandingList);

// ─── Visitor Transactions (finance/admin only) ─────────────────────────
router.get('/visitor-transactions', requireRole('finance', 'admin'), handleListVisitorTransactions);
router.get('/visitor-transactions/summary', requireRole('finance', 'admin'), handleGetVisitorRevenue);
router.put('/visitor-transactions/:id/pay', requireRole('finance', 'admin'), handleMarkVisitorPaid);

// ─── Revenue Dashboard (finance/admin only) ────────────────────────────
router.get('/dashboard/revenue-summary', requireRole('finance', 'admin'), handleGetRevenueSummary);

// ─── Audit Log (finance/admin only) ────────────────────────────────────
router.get('/audit', requireRole('finance', 'admin'), handleGetAuditLog);

export default router;
