import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        eventId:     {
            type: String,
            default: () => new mongoose.Types.ObjectId().toString(),
            required: true,
        },
        eventType: {
            type: String,
            enum: ['vehicle_entry', 'vehicle_exit', 'slot_occupied', 'slot_freed', 'plate_detected', 'heartbeat'],
            required: true,
        },
        deviceId: {
            type: String,
            required: true,
        },
        lotId: {
            type: String,
            required: true,
        },
        iotId: {
            type: String,
        },
        slotId: {
            type: String,
        },
        plateNumber: {
            type: String,
        },
        timestamp: {
            type: Date,
            default: Date.now,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

eventSchema.set('toJSON', {
    transform: (_, record) => {
        delete record.__v;
        return record;
    },
});

export default mongoose.models.Event || mongoose.model('Event', eventSchema);