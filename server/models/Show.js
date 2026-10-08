import mongoose from 'mongoose';
const priceSchema = new mongoose.Schema({ category: { type: String, enum: ['Regular', 'Premium', 'Recliner'], required: true }, amount: { type: Number, min: 0, required: true } }, { _id: false });
const showSchema = new mongoose.Schema({ movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true }, theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true, index: true }, screen: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen', required: true, index: true }, startsAt: { type: Date, required: true, index: true }, endsAt: { type: Date, required: true }, prices: [priceSchema], locks: [{ seat: String, user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, expiresAt: Date }], bookedSeats: [String], active: { type: Boolean, default: true } }, { timestamps: true });
showSchema.index({ screen:  1, startsAt: 1, endsAt: 1 });
export const Show = mongoose.model('Show', showSchema);
