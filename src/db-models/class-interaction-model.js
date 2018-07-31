import mongoose from 'mongoose';
import ClassActionSchema from './class-action-model';

const ClassInteractionSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    class_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true
    },
    action: {
      type: ClassActionSchema,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model(
  'ClassInteraction',
  ClassInteractionSchema,
  'class_interaction'
);
