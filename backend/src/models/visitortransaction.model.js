import mongoose from 'mongoose';

const visitorTransactionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    sessionId: {
      type: String,
      required: true,
    },
    plateNumber: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      default: 'visitor',
    },
    entryTime: {
      type: Date,
      required: true,
    },
    exitTime: {
      type: Date,
      required: true,
    },
    durationHours: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    paidAt: {
      type: Date,
    },
    paidBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

visitorTransactionSchema.index({ status: 1 });
visitorTransactionSchema.index({ sessionId: 1 });
visitorTransactionSchema.index({ entryTime: -1 });

visitorTransactionSchema.set('toJSON', {
  transform: (_, record) => {
    delete record.__v;
    return record;
  },
});

const VisitorTransaction =
  mongoose.models.VisitorTransaction ||
  mongoose.model('VisitorTransaction', visitorTransactionSchema);

export default VisitorTransaction;
