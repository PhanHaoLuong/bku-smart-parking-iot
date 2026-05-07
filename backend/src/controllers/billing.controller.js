import {
  getAllPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deactivatePolicy,
  listInvoices,
  getInvoiceById,
  generateInvoices,
  markInvoicePaid,
  getOutstandingList,
  listVisitorTransactions,
  getVisitorRevenueSummary,
  markVisitorPaid,
  getRevenueSummary,
  getAuditLog,
  getOutstandingLearners,
} from '../utils/billing.util.js';

// ─── Pricing Policies ──────────────────────────────────────────────────

export const handleGetAllPolicies = async (req, res) => {
  try {
    const policies = await getAllPolicies();
    res.status(200).json(policies);
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleGetPolicyById = async (req, res) => {
  try {
    const policy = await getPolicyById(req.params.id);
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    res.status(200).json(policy);
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleCreatePolicy = async (req, res) => {
  try {
    const policy = await createPolicy(req.body, req.user.id);
    res.status(201).json(policy);
  } catch (error) {
    console.error('Error creating policy:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An active policy already exists for this user/vehicle type' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleUpdatePolicy = async (req, res) => {
  try {
    const policy = await updatePolicy(req.params.id, req.body, req.user.id);
    res.status(200).json(policy);
  } catch (error) {
    console.error('Error updating policy:', error);
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleDeactivatePolicy = async (req, res) => {
  try {
    await deactivatePolicy(req.params.id, req.user.id);
    res.status(200).json({ message: 'Policy deactivated' });
  } catch (error) {
    console.error('Error deactivating policy:', error);
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Invoices ──────────────────────────────────────────────────────────

export const handleListInvoices = async (req, res) => {
  try {
    const filters = {};
    if (req.user.role !== 'finance' && req.user.role !== 'admin') {
      filters.userId = req.user.id;
    } else if (req.query.userId) {
      filters.userId = req.query.userId;
    }
    if (req.query.status) filters.status = req.query.status;

    const invoices = await listInvoices(filters);
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error listing invoices:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleGetInvoiceById = async (req, res) => {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    if (req.user.role !== 'finance' && req.user.role !== 'admin' && invoice.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleGenerateInvoices = async (req, res) => {
  try {
    const cycleEndDate = req.body.cycleEndDate || new Date();
    const result = await generateInvoices(cycleEndDate, req.user.id);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error generating invoices:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleMarkInvoicePaid = async (req, res) => {
  try {
    const { paidAmount } = req.body;
    const invoice = await markInvoicePaid(req.params.id, paidAmount, req.user.id);
    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error marking invoice paid:', error);
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Outstanding ───────────────────────────────────────────────────────

export const handleGetOutstandingList = async (req, res) => {
  try {
    const list = await getOutstandingList();
    const learners = await getOutstandingLearners();
    res.status(200).json({ invoices: list, learners });
  } catch (error) {
    console.error('Error fetching outstanding list:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Visitor Transactions ──────────────────────────────────────────────

export const handleListVisitorTransactions = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    const transactions = await listVisitorTransactions(filters);
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error listing visitor transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleGetVisitorRevenue = async (req, res) => {
  try {
    const summary = await getVisitorRevenueSummary();
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching visitor revenue:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleMarkVisitorPaid = async (req, res) => {
  try {
    const txn = await markVisitorPaid(req.params.id, req.user.id);
    res.status(200).json(txn);
  } catch (error) {
    console.error('Error marking visitor paid:', error);
    if (error.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Revenue Dashboard ─────────────────────────────────────────────────

export const handleGetRevenueSummary = async (req, res) => {
  try {
    const summary = await getRevenueSummary();
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching revenue summary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─── Audit Log ─────────────────────────────────────────────────────────

export const handleGetAuditLog = async (req, res) => {
  try {
    const filters = {};
    if (req.query.action) filters.action = req.query.action;
    if (req.query.startDate) filters.startDate = req.query.startDate;
    if (req.query.endDate) filters.endDate = req.query.endDate;

    const logs = await getAuditLog(filters);
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
