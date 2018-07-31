import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';

const ClassInviteSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true
    },
    email: {
      type: String,
      required: true
    },
    role: {
      type: String
    },
    status: {
      type: String,
      required: true
    },
    claimed_at: {
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

export default mongoose.model('ClassInvite', ClassInviteSchema, 'class_invite');
