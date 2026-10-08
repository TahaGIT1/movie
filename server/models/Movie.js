import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  slug: { type: String, unique: true, index: true }, title: { type: String, required: true, index: true },
  description: { type: String, default: '' }, posterImage: String, backdropImage: String,
  genre: [String], language: [String], formats: [String], durationMinutes: Number, rating: Number,
  releaseDate: Date, cast: [String], director: String, trailerUrl: String, trailerLabel: String, liveUrl: String,
  status: { type: String, enum: ['NOW_SHOWING', 'COMING_SOON', 'ARCHIVED'], default: 'NOW_SHOWING', index: true },
}, { timestamps: true });
export const Movie = mongoose.model('Movie', movieSchema);
