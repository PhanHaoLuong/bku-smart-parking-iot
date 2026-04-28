import mongoose from "mongoose";

const parkingSessionSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: () => new mongoose.Types.ObjectId().toString(),
        },
        userId: {
            type: String,
            default: 'iot-simulator',
        },
        plateNumber: {
            type: String,
            required: true,
        },
        entryTime: {
            type: Date,
            required: true,
        },
        exitTime: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['parked', 'exited'],
            default: 'parked',
        },  
        slotId: {
            type: String,
        },
        duration: {
            type: Number,
        },
        parkingLot: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

parkingSessionSchema.set('toJSON', {
    transform: (_, record) => {
        delete record.__v;
        return record;
    },
});

const ParkingSession = mongoose.models.ParkingSession || mongoose.model('ParkingSession', parkingSessionSchema);

export default ParkingSession;