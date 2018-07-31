import mongoose from 'mongoose';

const UserEmailVerificationSchema = new mongoose.Schema(
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
    verified_at: {
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
  'UserEmailVerification',
  UserEmailVerificationSchema,
  'user_email_verification'
);
