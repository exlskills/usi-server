import mongoose from 'mongoose';
import CharRangeSchema from './char-range-model';
import { DiscussionCommentSchema } from './discussion-comment-model';
import EmbeddedDocRefSchema from './embedded-doc-ref-model';

const CourseDiscussionSchema = new mongoose.Schema(
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
    course_id: {
      type: String,
      ref: 'Course',
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
    card_ref: {
      type: EmbeddedDocRefSchema
    },
    highlight_range: {
      type: CharRangeSchema
    },
    version: {
      type: Number
    },
    highlighted_text: {
      type: String
    },
    tags: {
      type: [String],
      required: true
    },
    like_count: {
      type: Number,
      default: 0
    },
    view_count: {
      type: Number,
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

CourseDiscussionSchema.index(
  { title: 'text' },
  { language_override: 'locale' }
);
CourseDiscussionSchema.index({ tags: 1 });

export default mongoose.model(
  'CourseDiscussion',
  CourseDiscussionSchema,
  'course_discussion'
);
