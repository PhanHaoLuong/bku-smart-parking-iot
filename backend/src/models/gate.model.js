import mongoose from "mongoose";

const gateSchema = new mongoose.Schema(
    {
        gateId: {
            type: String,
            required: true,
            unique: true,
        },
        lotId: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['entry', 'exit'],
            required: true,
        },
        status: {
            type: String,
            enum: ['open', 'closed', 'opening', 'closing', 'error'],
            default: 'closed',
        },
        position: {
            type: String,
            enum: ['up', 'down', 'moving'],
            default: 'down',
        },
        lastCommand: {
            type: String,
            enum: ['open', 'close', 'stop'],
        },
        lastCommandAt: {
            type: Date,
        },
        lastHeartbeat: {
            type: Date,
        },
        isOnline: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

gateSchema.set('toJSON', {
    transform: (_, record) => {
        delete record.__v;
        return record;
    },
});

export default mongoose.models.Gate || mongoose.model('Gate', gateSchema);
