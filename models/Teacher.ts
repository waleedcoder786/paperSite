import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    adminId: { type: String, required: true },
    role: { type: String, default: "teacher" },
    institute: String,
    address: String,
    logo: String,
    watermark: String,
    subjects: [String],
    classes: [String],
}, { timestamps: true });

export default mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);