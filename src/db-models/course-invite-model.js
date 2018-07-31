import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';

const CourseInviteSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    course_id: {
      type: String,
      ref: 'Course',
      required: true
    },
    url_key: {
      type: String,
      required: true,
      unique: true
    },
    user_id: {
      type: String,
      ref: 'User'
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

export default mongoose.model(
  'CourseInvite',
  CourseInviteSchema,
  'course_invite'
);
