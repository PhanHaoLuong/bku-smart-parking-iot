import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    action: {
      type: String,
      required: true,
      enum: [
        'pricing_created',
        'pricing_updated',
        'pricing_deactivated',
        'invoice_generated',
        'invoice_paid',
        'invoice_cancelled',
        'visitor_paid',
        'session_billed',
      ],
    },
    performedBy: {
      type: String,
      required: true,
    },
    performedByRole: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ performedBy: 1 });

auditLogSchema.set('toJSON', {
  transform: (_, record) => {
    delete record.__v;
    return record;
  },
});

const AuditLog =
  mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
