import mongoose from 'mongoose';
import IntlStringRecord from './intl-string-record-model.js';
import EmbeddedDocRefSchema from './embedded-doc-ref-model';

export default new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    object_type: {
      type: String,
      required: true
    },
    object_id: {
      type: String
    },
    is_cancelled: {
      type: Boolean,
      default: false
    },
    doc_ref: {
      type: EmbeddedDocRefSchema
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);
