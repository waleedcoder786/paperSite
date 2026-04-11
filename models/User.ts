import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  // ... baqi fields
}, { timestamps: true });

// Next.js Fix: Compilation error se bachne ke liye
export default mongoose.models.User || mongoose.model('User', userSchema);