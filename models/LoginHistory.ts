
import mongoose from 'mongoose';

const LoginHistorySchema = new mongoose.Schema({
  adminName: String,
  role: String,
  date: String,
  time: String,
  device: String,
  ipAddress: String,
  browser: String,
}, { timestamps: true });

export default mongoose.models.LoginHistory || mongoose.model('LoginHistory', LoginHistorySchema);