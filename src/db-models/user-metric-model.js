import mongoose from 'mongoose';

export default new mongoose.Schema(
  {
    _id: false,
    metric_id: {
      type: String,
      ref: 'Metric',
      required: true
    },
    value: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);
