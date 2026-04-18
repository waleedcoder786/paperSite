import mongoose from 'mongoose';

// Next.js hot reloading fix: purana model delete karein taaki naye fields (expiryDate etc) detect hon
if (mongoose.models && mongoose.models.User) {
  delete mongoose.models.User;
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
  phone: { type: String },
  institute: { type: String },
  address: { type: String },
  watermark: { type: String },
  logo: { type: String },
  profilePic: { 
    type: String, 
    default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' 
  },
  
  // Plan & Access Fields
  planType: { 
    type: String, 
    enum: ['basic', 'pro', 'premier'], 
    default: 'basic' 
  },
  accessType: { 
    type: String, 
    enum: ['full', 'half'], 
    default: 'half' 
  },
  expiryDate: { 
    type: Date,
    required: true // Ye lazmi hona chahiye
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.index({ name: 'text', institute: 'text' });

export default mongoose.models.User || mongoose.model('User', userSchema);