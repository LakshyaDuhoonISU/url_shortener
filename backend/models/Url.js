const mongoose = require('mongoose');

const clickStatSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    ip: {
        type: String,
        required: true
    },
    deviceType: {
        type: String,
        enum: ['mobile', 'tablet', 'desktop', 'unknown'],
        default: 'unknown'
    },
    browser: {
        type: String,
        default: 'unknown'
    },
    os: {
        type: String,
        default: 'unknown'
    },
    country: {
        type: String,
        default: 'unknown'
    },
    referrer: {
        type: String,
        default: ''
    }
});

const urlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true,
        trim: true
    },
    shortCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    customSlug: {
        type: String,
        trim: true,
        sparse: true // Allows multiple null values but enforces uniqueness for non-null values
    },
    title: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clickCount: {
        type: Number,
        default: 0
    },
    clickStats: [clickStatSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for better query performance
urlSchema.index({ shortCode: 1 });
urlSchema.index({ customSlug: 1 });
urlSchema.index({ creator: 1 });
urlSchema.index({ isActive: 1 });

// Virtual for getting the full shortened URL
urlSchema.virtual('shortUrl').get(function () {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/${this.customSlug || this.shortCode}`;
});

// Method to increment click count and add stats
urlSchema.methods.addClick = function (clickData) {
    this.clickCount += 1;
    this.clickStats.push(clickData);
    return this.save();
};

// Method to get click stats by date range
urlSchema.methods.getStatsByDateRange = function (startDate, endDate) {
    return this.clickStats.filter(stat =>
        stat.timestamp >= startDate && stat.timestamp <= endDate
    );
};

module.exports = mongoose.model('Url', urlSchema);