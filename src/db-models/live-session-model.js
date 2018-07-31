import mongoose from 'mongoose';

const LiveSessionSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: new mongoose.Types.ObjectId(),
      auto: true
    },
    presenter_workspace: {
      type: String,
      ref: 'Workspace',
      required: true
    }
    // workspace_template: {
    //   type: String,
    // },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export default mongoose.model('LiveSession', LiveSessionSchema, 'live_session');
