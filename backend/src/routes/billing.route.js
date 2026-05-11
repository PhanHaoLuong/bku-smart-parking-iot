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

// ─── Pricing Policies (finance only) ─────────────────────────────
router.get('/policies', requireRole('finance'), handleGetAllPolicies);
router.get('/policies/:id', requireRole('finance'), handleGetPolicyById);
router.post('/policies', requireRole('finance'), handleCreatePolicy);
router.put('/policies/:id', requireRole('finance'), handleUpdatePolicy);
router.delete('/policies/:id', requireRole('finance'), handleDeactivatePolicy);

// ─── Invoices ──────────────────────────────────────────────────────────
router.get('/invoices', requireRole('finance', 'learner', 'faculty'), handleListInvoices);
router.get('/invoices/:id', requireRole('finance', 'learner', 'faculty'), handleGetInvoiceById);
router.post('/invoices/generate', requireRole('finance'), handleGenerateInvoices);
router.put('/invoices/:id/pay', requireRole('finance'), handleMarkInvoicePaid);
router.get('/invoices/outstanding/list', requireRole('finance'), handleGetOutstandingList);

// ─── Visitor Transactions (finance only) ─────────────────────────
router.get('/visitor-transactions', requireRole('finance'), handleListVisitorTransactions);
router.get('/visitor-transactions/summary', requireRole('finance'), handleGetVisitorRevenue);
router.put('/visitor-transactions/:id/pay', requireRole('finance'), handleMarkVisitorPaid);

// ─── Revenue Dashboard (finance only) ────────────────────────────
router.get('/dashboard/revenue-summary', requireRole('finance'), handleGetRevenueSummary);

// ─── Audit Log (finance only) ────────────────────────────────────
router.get('/audit', requireRole('finance'), handleGetAuditLog);

export default router;