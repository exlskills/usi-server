import mongoose from 'mongoose';
import LikeSchema from './like-model.js';

export const DiscussionCommentSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    user_id: {
      type: String,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    likes: {
      type: [LikeSchema]
    },
    edits: {
      type: [String]
    },
    is_deleted: {
      type: Boolean,
      default: false
    },
    deleted_at: {
      type: Date,
      default: new Date()
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

DiscussionCommentSchema.add({
  comments: [DiscussionCommentSchema]
});
