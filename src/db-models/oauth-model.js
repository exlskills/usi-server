import mongoose from 'mongoose';

export default new mongoose.Schema(
  {
    id: {
      type: String
    },
    token: {
      type: String
    },
    name: {
      type: String
    },
    picture: {
      type: String
    },
    locale: {
      type: String
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);
