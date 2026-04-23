import mongoose from "mongoose";

const parkingHistorySchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: () => new mongoose.Types.ObjectId().toString(),
        },
        userId: {
            type: String,
            required: true,
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
        parkingLot: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

parkingHistorySchema.set('toJSON', {
    transform: (_, record) => {
        delete record.__v;
        return record;
    },
});

const ParkingHistory = mongoose.models.ParkingHistory || mongoose.model('ParkingHistory', parkingHistorySchema);

export default ParkingHistory;