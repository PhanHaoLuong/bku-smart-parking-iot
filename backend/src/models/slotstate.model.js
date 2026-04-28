import mongoose from "mongoose";

const slotStateSchema = new mongoose.Schema(
    {
        slotId: {
            type: String,
            required: true,
        },
        iotId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['occupied', 'free'],
            default: 'free',
        },
        plateNumber: {
            type: String,
        },
        currentSessionId: {
            type: String,
        },
        lastEventId: {
            type: String,
        },
        lastEventType: {
            type: String,
        },
        lastChangeTime: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

slotStateSchema.set('toJSON', {
    transform: (_, record) => {
        delete record.__v;
        return record;
    },
});

export default mongoose.models.SlotState || mongoose.model('SlotState', slotStateSchema);