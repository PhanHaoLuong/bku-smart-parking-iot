import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: 'learner',
      enum: ['admin', 'operator', 'learner', 'faculty'],
    },
    cardActive: {
      type: Boolean,
      default: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.set('toJSON', {
  transform: (_, record) => {
    delete record.password;
    delete record.__v;
    return record;
  },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;