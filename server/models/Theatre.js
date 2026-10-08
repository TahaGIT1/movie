import mongoose from 'mongoose';
const theatreSchema = new mongoose.Schema({ name: { type: String, required: true }, location: String, city: { type: String, required: true, index: true }, features: [String], active: { type: Boolean, default: true } }, { timestamps: true });
export const Theatre = mongoose.model('Theatre', theatreSchema);
