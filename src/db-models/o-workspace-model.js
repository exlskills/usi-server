import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';

const OWorkspaceSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    src: {
      type: String,
      required: true
    },
    seq: {
      type: Number,
      required: true
    },
    v: {
      type: Number,
      required: true
    },
    create: {
      type: Object, // to do check ToCheck
      required: true
    },
    m: {
      type: Object, //to do check ToCheck
      required: true
    },
    d: {
      type: String,
      required: true
    },
    o: {
      type: String
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('OWorkspace', OWorkspaceSchema, 'o_workspace');
