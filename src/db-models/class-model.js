import mongoose from 'mongoose';
import IntlStringSchema from './intl-string-model';

const ClassSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    title: {
      type: IntlStringSchema,
      required: true
    },
    headline: {
      type: IntlStringSchema,
      required: true
    },
    description: {
      type: IntlStringSchema,
      required: true
    },
    creator_id: {
      type: String,
      ref: 'User',
      required: true
    },
    course_ids: {
      type: [String],
      ref: 'Course'
    },
    class_code: {
      type: String,
      unique: true,
      required: true
    },
    logo_url: {
      type: String,
      required: true
    },
    cover_url: {
      type: String,
      required: true
    },
    enrolled_count: {
      type: Number,
      default: 0
    },
    view_count: {
      type: Number,
      default: 0
    },
    primary_locale: {
      type: String,
      required: true
    },
    topics: {
      type: [String]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

ClassSchema.index(
  { 'title.intlString.content': 'text' },
  { language_override: 'locale' }
);
ClassSchema.index({ topics: 1 });

export default mongoose.model('Class', ClassSchema, 'class');
