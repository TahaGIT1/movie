import mongoose from 'mongoose';
const seatSchema = new mongoose.Schema({ row: { type: String, required: true }, number: { type: Number, required: true }, category: { type: String, enum: ['Regular', 'Premium', 'Recliner'], default: 'Regular' }, active: { type: Boolean, default: true } }, { _id: false });
const screenSchema = new mongoose.Schema({ theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true, index: true }, name: { type: String, required: true }, seats: [seatSchema], scheduleLockUntil: Date, scheduleLockToken: String }, { timestamps: true });
screenSchema.virtual('totalSeats').get(function () { return this.seats.length; });
export const Screen = mongoose.model('Screen', screenSchema);
