import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
    data: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.models.Class || mongoose.model('Class', ClassSchema);