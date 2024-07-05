import mongoose, { Schema } from 'mongoose';

const WatchlistSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    movieIds: [{
        type: String,
        required: true
    }],
    tvShowIds: [{
        type: String,
        required: true
    }],
    animeIds: [{
        type: String,
        required: true
    }]
}, { timestamps: true })

export const Watchlist = mongoose.models.Watchlist || mongoose.model('Watchlist', WatchlistSchema);