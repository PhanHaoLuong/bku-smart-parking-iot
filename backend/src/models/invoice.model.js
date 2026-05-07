import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema(
  {
    sessionId: { type: String },
    plateNumber: { type: String },
    entryTime: { type: Date },
    exitTime: { type: Date },
    rate: { type: Number },
    amount: { type: Number },
    vehicleType: { type: String },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    userId: {
      type: String,
      required: true,
    },
    billingPeriodStart: {
      type: Date,
      required: true,
    },
    billingPeriodEnd: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'cancelled'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidAt: {
      type: Date,
    },
    paidAmount: {
      type: Number,
    },
    paidBy: {
      type: String,
    },
    items: {
      type: [invoiceItemSchema],
      default: [],
    },
    notes: {
      type: String,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ billingPeriodEnd: -1 });

invoiceSchema.set('toJSON', {
  transform: (_, record) => {
    delete record.__v;
    return record;
  },
});

const Invoice =
  mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);

export default Invoice;
