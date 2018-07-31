import mongoose from 'mongoose';
import { id_gen } from '../utils/url-id-generator';
import IntlStringSchema from './intl-string-model';
import EmbeddedDocRefSchema from './embedded-doc-ref-model';

const QuestionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: id_gen
    },
    doc_ref: {
      type: EmbeddedDocRefSchema
    },
    tags: {
      type: [String],
      required: true
    },
    question_type: {
      type: String,
      required: true
    },
    question_text: {
      type: IntlStringSchema,
      required: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // QuestionFreeReponseData | [QuestionMultipleData]
      required: true
    },
    hint: {
      type: IntlStringSchema
    },
    points: {
      type: Number,
      default: 1,
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('Question', QuestionSchema, 'question');
