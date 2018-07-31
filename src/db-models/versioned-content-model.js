import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import VersionedContentRecordSchema from './versioned-content-record-model.js';

const VersionedContentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    latest_version: {
      type: Number,
      required: true
    },
    contents: {
      type: [VersionedContentRecordSchema]
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model(
  'VersionedContent',
  VersionedContentSchema,
  'versioned_content'
);
