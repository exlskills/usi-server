import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import IntlStringSchema from './intl-string-model';

const MetricSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    title: {
      type: IntlStringSchema,
      required: true
    },
    description: {
      type: IntlStringSchema,
      required: true
    },
    unit: {
      type: IntlStringSchema,
      required: true
    },
    calculation_query: {
      type: String,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('Metric', MetricSchema, 'metric');
