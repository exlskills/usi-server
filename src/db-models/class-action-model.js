import mongoose from 'mongoose';

export default new mongoose.Schema({
  action: {
    type: String,
    enum: ['invited', 'joined']
  },
  recorded_at: {
    type: Date
  }
});
