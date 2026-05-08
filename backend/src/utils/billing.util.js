import PricingPolicy from '../models/pricingpolicy.model.js';
import Invoice from '../models/invoice.model.js';
import VisitorTransaction from '../models/visitortransaction.model.js';
import AuditLog from '../models/auditlog.model.js';
import ParkingSession from '../models/parkingsession.model.js';
import User from '../models/user.model.js';

// ─── Pricing Policy CRUD ───────────────────────────────────────────────

export const getAllPolicies = async () => PricingPolicy.find().sort({ userType: 1, vehicleType: 1 }).lean();

export const getPolicyById = async (id) => PricingPolicy.findById(id).lean();

export const createPolicy = async (data, userId) => {
  const policy = await PricingPolicy.create({ ...data, createdBy: userId, updatedBy: userId });
  await safeLogAudit({
    action: 'pricing_created',
    performedBy: userId,
    description: `Created pricing policy for ${data.userType}/${data.vehicleType} (${data.pricingMode})`,
    details: { newValues: data },
  });
  return policy;
};

export const updatePolicy = async (id, data, userId) => {
  const oldPolicy = await PricingPolicy.findById(id).lean();
  if (!oldPolicy) throw Object.assign(new Error('Policy not found'), { status: 404 });

  const updated = await PricingPolicy.findByIdAndUpdate(
    id,
    { ...data, updatedBy: userId },
    { new: true }
  ).lean();

  await safeLogAudit({
    action: 'pricing_updated',
    performedBy: userId,
    description: `Updated pricing policy for ${updated.userType}/${updated.vehicleType}`,
    details: { oldValues: oldPolicy, newValues: updated },
  });

  return updated;
};

export const deactivatePolicy = async (id, userId) => {
  const policy = await PricingPolicy.findById(id).lean();
  if (!policy) throw Object.assign(new Error('Policy not found'), { status: 404 });

  await PricingPolicy.findByIdAndUpdate(id, { isActive: false, updatedBy: userId });

  await safeLogAudit({
    action: 'pricing_deactivated',
    performedBy: userId,
    description: `Deactivated pricing policy for ${policy.userType}/${policy.vehicleType}`,
    details: { deactivated: policy },
  });
};

// ─── Fee Calculation ───────────────────────────────────────────────────

export const getApplicablePolicy = async (userType, vehicleType) => {
  const policy = await PricingPolicy.findOne({
    userType,
    vehicleType,
    isActive: true,
    $or: [{ effectiveTo: null }, { effectiveTo: { $gte: new Date() } }],
  }).lean();

  return policy;
};

export const calculateSessionFee = (session, policy) => {
  if (!policy) return 0;
  if (policy.isFree) return 0;

  const entryHour = new Date(session.entryTime).getHours();

  let baseRate;
  if (entryHour >= 6 && entryHour < 18) {
    baseRate = policy.daytimeRate || 0;
  } else if (entryHour >= 18 && entryHour < 24) {
    baseRate = policy.eveningRate || 0;
  } else {
    baseRate = policy.daytimeRate || 0;
  }

  const discount = (policy.discountPercent || 0) / 100;
  return Math.round(baseRate * (1 - discount));
};

export const calculateVisitorFee = (entryTime, exitTime, policy) => {
  if (!exitTime) return 0;
  if (!policy) return 0;

  const durationMs = new Date(exitTime).getTime() - new Date(entryTime).getTime();
  const durationHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));

  if (durationHours <= 1) {
    return policy.firstHourRate || 0;
  }

  return (policy.firstHourRate || 0) + (durationHours - 1) * (policy.subsequentHourlyRate || 0);
};

// ─── Invoice Generation ────────────────────────────────────────────────

export const generateInvoices = async (cycleEndDate, performedBy) => {
  const learners = await User.find({ userType: 'learner' }).lean();
  const generated = [];

  const policyMap = {};
  const policies = await PricingPolicy.find({ isActive: true, userType: 'learner' }).lean();
  for (const p of policies) {
    policyMap[`${p.userType}-${p.vehicleType}`] = p;
  }

  // Determine cycle start as 30 days before cycleEnd
  const cycleStart = new Date(cycleEndDate);
  cycleStart.setDate(cycleStart.getDate() - 30);

  for (const learner of learners) {
    const vehicleType = learner.vehicleType || 'motorcycle';
    const policyKey = `learner-${vehicleType}`;

    // Find sessions already invoiced for this learner in this period
    const existingInvoices = await Invoice.find({
      userId: learner._id.toString(),
      billingPeriodEnd: { $gte: cycleStart },
    }).lean();
    const invoicedSessionIds = new Set(
      existingInvoices.flatMap((inv) => (inv.items || []).map((item) => item.sessionId))
    );

    const sessions = await ParkingSession.find({
      userId: learner._id.toString(),
      status: 'exited',
      exitTime: { $gte: cycleStart, $lte: cycleEndDate },
      _id: { $nin: [...invoicedSessionIds] },
    }).lean();

    if (sessions.length === 0) continue;

    const policy = policyMap[policyKey] || policyMap['learner-motorcycle'];
    if (!policy) continue;

    const items = [];
    let totalAmount = 0;

    for (const session of sessions) {
      const amount = calculateSessionFee(session, policy);
      items.push({
        sessionId: session._id,
        plateNumber: session.plateNumber,
        entryTime: session.entryTime,
        exitTime: session.exitTime,
        rate: amount,
        amount,
        vehicleType: session.vehicleType || 'motorcycle',
      });
      totalAmount += amount;
    }

    const dueDate = new Date(cycleEndDate);
    dueDate.setDate(dueDate.getDate() + 15);

    const invoice = await Invoice.create({
      userId: learner._id.toString(),
      billingPeriodStart: cycleStart,
      billingPeriodEnd: cycleEndDate,
      totalAmount,
      status: 'pending',
      dueDate,
      items,
    });

    generated.push(invoice._id);

    await safeLogAudit({
      action: 'invoice_generated',
      performedBy,
      description: `Generated invoice for ${learner.fullName || learner.username}: ${totalAmount.toLocaleString()} VND (${items.length} sessions)`,
      details: { invoiceId: invoice._id, userId: learner._id, totalAmount, sessionCount: items.length },
    });
  }

  return { generatedCount: generated.length, invoiceIds: generated };
};

// ─── Invoice Management ────────────────────────────────────────────────

export const listInvoices = async (filters = {}) => {
  const query = {};
  if (filters.userId) query.userId = filters.userId;
  if (filters.status) query.status = filters.status;
  if (filters.userIds) query.userId = { $in: filters.userIds };

  return Invoice.find(query).sort({ billingPeriodEnd: -1 }).lean();
};

export const getInvoiceById = async (id) => Invoice.findById(id).lean();

export const getOutstandingList = async () => {
  const invoices = await Invoice.find({ status: { $in: ['pending', 'overdue'] } })
    .sort({ dueDate: 1 })
    .lean();

  const userIds = [...new Set(invoices.map((inv) => inv.userId))];
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userMap = {};
  for (const u of users) userMap[u._id.toString()] = u;

  return invoices.map((inv) => ({
    invoiceId: inv._id,
    userId: inv.userId,
    userName: userMap[inv.userId]?.fullName || userMap[inv.userId]?.username || 'Unknown',
    totalAmount: inv.totalAmount,
    status: inv.status,
    dueDate: inv.dueDate,
    periodStart: inv.billingPeriodStart,
    periodEnd: inv.billingPeriodEnd,
  }));
};

export const markInvoicePaid = async (invoiceId, paidAmount, paidBy) => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw Object.assign(new Error('Invoice not found'), { status: 404 });

  invoice.status = 'paid';
  invoice.paidAt = new Date();
  invoice.paidAmount = paidAmount ?? invoice.totalAmount;
  invoice.paidBy = paidBy;
  await invoice.save();

  await safeLogAudit({
    action: 'invoice_paid',
    performedBy: paidBy,
    description: `Invoice ${invoiceId} marked paid: ${(paidAmount ?? invoice.totalAmount).toLocaleString()} VND`,
    details: { invoiceId, userId: invoice.userId, paidAmount: paidAmount ?? invoice.totalAmount },
  });

  return invoice.toJSON();
};

// ─── Visitor Transactions ──────────────────────────────────────────────

export const listVisitorTransactions = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;

  return VisitorTransaction.find(query).sort({ entryTime: -1 }).lean();
};

export const getVisitorRevenueSummary = async () => {
  const transactions = await VisitorTransaction.find().lean();

  const paid = transactions
    .filter((t) => t.status === 'paid')
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  const pending = transactions
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  return { paid, pending, total: paid + pending, count: transactions.length };
};

export const markVisitorPaid = async (transactionId, paidBy) => {
  const txn = await VisitorTransaction.findById(transactionId);
  if (!txn) throw Object.assign(new Error('Visitor transaction not found'), { status: 404 });

  txn.status = 'paid';
  txn.paidAt = new Date();
  txn.paidBy = paidBy;
  await txn.save();

  await safeLogAudit({
    action: 'visitor_paid',
    performedBy: paidBy,
    description: `Visitor payment recorded for ${txn.plateNumber}: ${txn.totalAmount.toLocaleString()} VND`,
    details: { transactionId, plateNumber: txn.plateNumber, amount: txn.totalAmount },
  });

  return txn.toJSON();
};

// ─── Revenue Dashboard ─────────────────────────────────────────────────

export const getRevenueSummary = async () => {
  const invoices = await Invoice.find().lean();
  const visitorTxns = await VisitorTransaction.find().lean();

  const invoicePaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.paidAmount || inv.totalAmount || 0), 0);

  const invoiceOutstanding = invoices
    .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  const visitorPaid = visitorTxns
    .filter((t) => t.status === 'paid')
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  const visitorPending = visitorTxns
    .filter((t) => t.status === 'pending')
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  return {
    learnerRevenue: {
      paid: invoicePaid,
      outstanding: invoiceOutstanding,
      total: invoicePaid + invoiceOutstanding,
    },
    visitorRevenue: {
      paid: visitorPaid,
      pending: visitorPending,
      total: visitorPaid + visitorPending,
    },
    totalRevenue: invoicePaid + invoiceOutstanding + visitorPaid + visitorPending,
    collectedRevenue: invoicePaid + visitorPaid,
    outstandingRevenue: invoiceOutstanding + visitorPending,
  };
};

// ─── Audit Log ─────────────────────────────────────────────────────────

export const getAuditLog = async (filters = {}) => {
  const query = {};
  if (filters.action) query.action = filters.action;
  if (filters.startDate || filters.endDate) {
    query.timestamp = {};
    if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
    if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
  }

  return AuditLog.find(query).sort({ timestamp: -1 }).limit(200).lean();
};

const logAudit = async ({ action, performedBy, description, details }) => {
  let performedByRole = 'unknown';
  try {
    const user = await User.findById(performedBy).lean();
    if (user) performedByRole = user.role;
  } catch {
    // ignore
  }

  await AuditLog.create({
    action,
    performedBy,
    performedByRole,
    description,
    details,
    timestamp: new Date(),
  });
};

const safeLogAudit = async (payload) => {
  try {
    await logAudit(payload);
  } catch (error) {
    console.error('Audit log write failed:', error);
  }
};

// ─── Outstanding Learners (for finance dashboard) ──────────────────────

export const getOutstandingLearners = async () => {
  const outstanding = await Invoice.aggregate([
    { $match: { status: { $in: ['pending', 'overdue'] } } },
    { $group: { _id: '$userId', totalDebt: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    { $sort: { totalDebt: -1 } },
  ]);

  const userIds = outstanding.map((o) => o._id);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userMap = {};
  for (const u of users) userMap[u._id.toString()] = u;

  return outstanding.map((o) => ({
    userId: o._id,
    userName: userMap[o._id]?.fullName || userMap[o._id]?.username || 'Unknown',
    totalDebt: o.totalDebt,
    invoiceCount: o.count,
  }));
};
