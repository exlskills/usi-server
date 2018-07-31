import mongoose from 'mongoose';
import CharRangeSchema from './char-range-model';
import { DiscussionCommentSchema } from './discussion-comment-model';

const ClassDiscussionSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    creator_id: {
      type: String,
      ref: 'User',
      required: true
    },
    class_id: {
      type: String,
      ref: 'Class',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    locale: {
      type: String,
      required: true
    },
    tags: {
      type: [String],
      required: true
    },
    like_count: {
      type: Number,
      required: true,
      default: 0
    },
    view_count: {
      type: Number,
      required: true,
      default: 0
    },
    comments: {
      type: [DiscussionCommentSchema]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

ClassDiscussionSchema.index({ title: 'text' }, { language_override: 'locale' });
ClassDiscussionSchema.index({ tags: 1 });

export default mongoose.model(
  'ClassDiscussion',
  ClassDiscussionSchema,
  'class_discussion'
);
