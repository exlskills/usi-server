import mongoose from 'mongoose';

const UserPwdResetSchema = new mongoose.Schema(
  {
    url_key: {
      type: String,
      required: true,
      unique: true
    },
    user_id: {
      type: String,
      ref: 'User',
      required: true
    },
    email: {
      type: String,
      required: true
    },
    reset_at: {
      type: Date
    },
    expires_at: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model(
  'UserPwdReset',
  UserPwdResetSchema,
  'user_pwd_reset'
);
