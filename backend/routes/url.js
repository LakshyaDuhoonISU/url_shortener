const express = require('express');
const Url = require('../models/Url');
const auth = require('../middleware/auth');
const { generateShortCode, isValidUrl, parseUserAgent, getClientIP } = require('../utils/helpers');

const router = express.Router();

// @route   POST /api/url/shorten
// @desc    Create a short link with random or custom slug
// @access  Private
router.post('/shorten', auth, async (req, res) => {
    try {
        const { originalUrl, customSlug, title, description } = req.body;

        // Validation
        if (!originalUrl) {
            return res.status(400).json({ message: 'Original URL is required' });
        }

        if (!isValidUrl(originalUrl)) {
            return res.status(400).json({ message: 'Please provide a valid URL' });
        }

        // Check if custom slug is already taken
        if (customSlug) {
            const existingUrl = await Url.findOne({
                $or: [
                    { customSlug: customSlug },
                    { shortCode: customSlug }
                ]
            });

            if (existingUrl) {
                return res.status(400).json({ message: 'Custom slug is already taken' });
            }
        }

        // Generate unique short code
        let shortCode;
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
            shortCode = generateShortCode();
            const existingUrl = await Url.findOne({
                $or: [
                    { shortCode: shortCode },
                    { customSlug: shortCode }
                ]
            });

            if (!existingUrl) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            return res.status(500).json({ message: 'Failed to generate unique short code' });
        }

        // Create new URL
        const newUrl = new Url({
            originalUrl,
            shortCode,
            customSlug: customSlug || null,
            title: title || '',
            description: description || '',
            creator: req.user._id
        });

        await newUrl.save();

        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        const shortUrl = `${baseUrl}/${customSlug || shortCode}`;

        res.status(201).json({
            message: 'URL shortened successfully',
            url: {
                id: newUrl._id,
                originalUrl: newUrl.originalUrl,
                shortUrl,
                shortCode: newUrl.shortCode,
                customSlug: newUrl.customSlug,
                title: newUrl.title,
                description: newUrl.description,
                clickCount: newUrl.clickCount,
                isActive: newUrl.isActive,
                createdAt: newUrl.createdAt
            }
        });
    } catch (error) {
        console.error('URL shortening error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/url/:id
// @desc    Update the short link
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { originalUrl, customSlug, title, description } = req.body;

        // Find URL and check ownership
        const url = await Url.findOne({ _id: id, creator: req.user._id });

        if (!url) {
            return res.status(404).json({ message: 'URL not found or you do not have permission to edit it' });
        }

        // Validate original URL if provided
        if (originalUrl && !isValidUrl(originalUrl)) {
            return res.status(400).json({ message: 'Please provide a valid URL' });
        }

        // Check if custom slug is available (if different from current)
        if (customSlug && customSlug !== url.customSlug) {
            const existingUrl = await Url.findOne({
                _id: { $ne: id },
                $or: [
                    { customSlug: customSlug },
                    { shortCode: customSlug }
                ]
            });

            if (existingUrl) {
                return res.status(400).json({ message: 'Custom slug is already taken' });
            }
        }

        // Update fields
        if (originalUrl) url.originalUrl = originalUrl;
        if (customSlug !== undefined) url.customSlug = customSlug || null;
        if (title !== undefined) url.title = title;
        if (description !== undefined) url.description = description;

        await url.save();

        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        const shortUrl = `${baseUrl}/${url.customSlug || url.shortCode}`;

        res.json({
            message: 'URL updated successfully',
            url: {
                id: url._id,
                originalUrl: url.originalUrl,
                shortUrl,
                shortCode: url.shortCode,
                customSlug: url.customSlug,
                title: url.title,
                description: url.description,
                clickCount: url.clickCount,
                isActive: url.isActive,
                updatedAt: url.updatedAt
            }
        });
    } catch (error) {
        console.error('URL update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/url/:id
// @desc    Permanently delete a short link
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        // Find URL and check ownership
        const url = await Url.findOne({ _id: id, creator: req.user._id });

        if (!url) {
            return res.status(404).json({ message: 'URL not found or you do not have permission to delete it' });
        }

        // Delete the URL permanently
        await Url.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'URL deleted successfully'
        });
    } catch (error) {
        console.error('URL deletion error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/url/:id/click
// @desc    Increment the count every time a specific short link is called (manual tracking)
// @access  Public
router.post('/:id/click', async (req, res) => {
    try {
        const { id } = req.params;

        const url = await Url.findById(id);

        if (!url) {
            return res.status(404).json({ message: 'URL not found' });
        }

        if (!url.isActive) {
            return res.status(403).json({ message: 'URL is disabled' });
        }

        // Parse user agent and get client info
        const userAgent = req.headers['user-agent'] || '';
        const deviceInfo = parseUserAgent(userAgent);
        const clientIP = getClientIP(req);

        // Add click statistics
        const clickData = {
            ip: clientIP,
            deviceType: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            referrer: req.headers.referer || '',
            timestamp: new Date()
        };

        // Increment click count and add stats
        await url.addClick(clickData);

        res.json({
            message: 'Click recorded successfully',
            clickCount: url.clickCount
        });
    } catch (error) {
        console.error('Click tracking error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/url/:id/stats
// @desc    Generate stats for a shortened URL
// @access  Private
router.get('/:id/stats', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        // Find URL and check ownership
        const url = await Url.findOne({ _id: id, creator: req.user._id });

        if (!url) {
            return res.status(404).json({ message: 'URL not found or you do not have permission to view its stats' });
        }

        let clickStats = url.clickStats;

        // Filter by date range if provided
        if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : new Date(0);
            let end;

            if (endDate) {
                end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
            } else {
                end = new Date();
            }

            clickStats = url.getStatsByDateRange(start, end);
        }

        // Generate statistics
        const stats = {
            totalClicks: clickStats.length,
            uniqueIPs: [...new Set(clickStats.map(stat => stat.ip))].length,
            deviceTypes: {},
            browsers: {},
            operatingSystems: {},
            countries: {},
            clicksByDate: {},
            recentClicks: clickStats.slice(-10).reverse()
        };

        // Process statistics
        clickStats.forEach(stat => {
            // Device types
            stats.deviceTypes[stat.deviceType] = (stats.deviceTypes[stat.deviceType] || 0) + 1;

            // Browsers
            stats.browsers[stat.browser] = (stats.browsers[stat.browser] || 0) + 1;

            // Operating systems
            stats.operatingSystems[stat.os] = (stats.operatingSystems[stat.os] || 0) + 1;

            // Countries
            stats.countries[stat.country] = (stats.countries[stat.country] || 0) + 1;

            // Clicks by date
            const date = stat.timestamp.toISOString().split('T')[0];
            stats.clicksByDate[date] = (stats.clicksByDate[date] || 0) + 1;
        });

        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        const shortUrl = `${baseUrl}/${url.customSlug || url.shortCode}`;

        res.json({
            url: {
                id: url._id,
                originalUrl: url.originalUrl,
                shortUrl,
                title: url.title,
                description: url.description,
                createdAt: url.createdAt
            },
            stats
        });
    } catch (error) {
        console.error('Stats generation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/url/:id/disable
// @desc    Disable a shortened URL
// @access  Private
router.put('/:id/disable', auth, async (req, res) => {
    try {
        const { id } = req.params;

        // Find URL and check ownership
        const url = await Url.findOne({ _id: id, creator: req.user._id });

        if (!url) {
            return res.status(404).json({ message: 'URL not found or you do not have permission to disable it' });
        }

        url.isActive = false;
        await url.save();

        res.json({
            message: 'URL disabled successfully',
            url: {
                id: url._id,
                isActive: url.isActive,
                updatedAt: url.updatedAt
            }
        });
    } catch (error) {
        console.error('URL disable error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/url/:id/enable
// @desc    Enable a shortened URL
// @access  Private
router.put('/:id/enable', auth, async (req, res) => {
    try {
        const { id } = req.params;

        // Find URL and check ownership
        const url = await Url.findOne({ _id: id, creator: req.user._id });

        if (!url) {
            return res.status(404).json({ message: 'URL not found or you do not have permission to enable it' });
        }

        url.isActive = true;
        await url.save();

        res.json({
            message: 'URL enabled successfully',
            url: {
                id: url._id,
                isActive: url.isActive,
                updatedAt: url.updatedAt
            }
        });
    } catch (error) {
        console.error('URL enable error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/url/my-urls
// @desc    Get all shortened URLs for the authenticated user
// @access  Private
router.get('/my-urls', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const skip = (page - 1) * limit;

        // Build query
        let query = { creator: req.user._id };

        if (search) {
            query.$or = [
                { originalUrl: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { shortCode: { $regex: search, $options: 'i' } },
                { customSlug: { $regex: search, $options: 'i' } }
            ];
        }

        // Get URLs with pagination
        const urls = await Url.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Url.countDocuments(query);

        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

        const formattedUrls = urls.map(url => ({
            id: url._id,
            originalUrl: url.originalUrl,
            shortUrl: `${baseUrl}/${url.customSlug || url.shortCode}`,
            shortCode: url.shortCode,
            customSlug: url.customSlug,
            title: url.title,
            description: url.description,
            clickCount: url.clickCount,
            isActive: url.isActive,
            createdAt: url.createdAt,
            updatedAt: url.updatedAt
        }));

        res.json({
            urls: formattedUrls,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                totalUrls: total
            }
        });
    } catch (error) {
        console.error('Get URLs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/url/search
// @desc    Text search a URL in the database to get its details
// @access  Private
router.get('/search', auth, async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Search in user's URLs
        const urls = await Url.find({
            creator: req.user._id,
            $or: [
                { originalUrl: { $regex: q, $options: 'i' } },
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { shortCode: { $regex: q, $options: 'i' } },
                { customSlug: { $regex: q, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });

        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

        const formattedUrls = urls.map(url => ({
            id: url._id,
            originalUrl: url.originalUrl,
            shortUrl: `${baseUrl}/${url.customSlug || url.shortCode}`,
            shortCode: url.shortCode,
            customSlug: url.customSlug,
            title: url.title,
            description: url.description,
            clickCount: url.clickCount,
            isActive: url.isActive,
            createdAt: url.createdAt
        }));

        res.json({
            query: q,
            results: formattedUrls,
            count: formattedUrls.length
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /:shortCode
// @desc    Redirect to the specified URL using short link
// @access  Public
router.get('/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;

        // Find URL by shortCode or customSlug
        const url = await Url.findOne({
            $or: [
                { shortCode: shortCode },
                { customSlug: shortCode }
            ],
            isActive: true
        });

        if (!url) {
            return res.status(404).json({ message: 'URL not found or disabled' });
        }

        // Check if URL has expired
        if (url.expiresAt && url.expiresAt < new Date()) {
            return res.status(410).json({ message: 'URL has expired' });
        }

        // Parse user agent and get client info
        const userAgent = req.headers['user-agent'] || '';
        const deviceInfo = parseUserAgent(userAgent);
        const clientIP = getClientIP(req);

        // Add click statistics
        const clickData = {
            ip: clientIP,
            deviceType: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            referrer: req.headers.referer || '',
            timestamp: new Date()
        };

        // Increment click count and add stats
        await url.addClick(clickData);

        // Redirect to original URL
        res.redirect(url.originalUrl);
    } catch (error) {
        console.error('Redirect error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;