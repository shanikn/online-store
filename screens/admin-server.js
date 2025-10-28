const persist = require('../persist_module');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/products/');
    },
    filename: function (req, file, cb) {
        // Create unique filename: timestamp-randomnumber-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png)'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = {
    upload, // Export upload middleware for use in routes
    async getActivities(req, res) {
        try {
            // Get filter parameters from query string (usernamePrefix is for legacy compatibility)
            const usernamePrefix = req.query.usernamePrefix || req.query.prefix || null;

            // Get all activities first
            let activities = await persist.getAllActivities();

            // Filter to only include the required activity types: LOGIN, LOGOUT, ADD-TO-CART
            activities = activities.filter(activity =>
                activity.activityType === 'login' ||
                activity.activityType === 'logout' ||
                activity.activityType === 'add-to-cart'
            );

            let filteredActivities = activities;
            if (usernamePrefix) {
                // Filter by username prefix if specified
                filteredActivities = activities.filter(activity =>
                    activity.username && activity.username.toLowerCase().startsWith(usernamePrefix.toLowerCase())
                );
                console.log(`Filtering activities by prefix '${usernamePrefix}', found ${filteredActivities.length} matches`);
            }

            // Sort by timestamp descending (newest first)
            filteredActivities = filteredActivities.sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
            );

            // Transform activity types to match the required format
            filteredActivities = filteredActivities.map(activity => {
                // Standardize activity type format
                let type = activity.activityType.toUpperCase();
                if (type === 'ADD-TO-CART') {
                    type = 'ADD-TO-CART';
                }

                return {
                    timestamp: activity.timestamp,
                    username: activity.username,
                    type: type
                };
            });

            res.json(filteredActivities);
        } catch (error) {
            console.error('Error loading activities:', error);
            res.status(500).json({ success: false, error: 'Failed to load activities' });
        }
    },

    async getSales(req, res) {
        try {
            let totalSales = 0;
            let totalOrders = 0;

            // Get all purchases from file directly
            const allPurchases = await persist.loadData('purchases.json', {});

            // Calculate total sales across all users
            Object.values(allPurchases).forEach(userPurchases => {
                if(Array.isArray(userPurchases)){
                    userPurchases.forEach(purchase => {
                        totalSales += purchase.total || 0;
                        totalOrders++;
                    });
                }
            });

            res.json({
                totalSales: totalSales.toFixed(2),
                totalOrders,
                currency: '₪'
            });
        } catch (error) {
            console.error('Error calculating sales:', error);
            res.status(500).json({ success: false, error: 'Failed to calculate sales' });
        }
    },

    async addProduct(req, res) {
        try {
            const username = req.cookies.userToken || null;
            const { name, description, price, category, image, customizable } = req.body;

            // Validate required fields
            if (!name || !description || price === undefined || !category) {
                return res.status(400).json({
                    success: false,
                    error: 'Product requires name, description, price, and category'
                });
            }

            // Validate price is a number
            const numPrice = parseFloat(price);
            if (isNaN(numPrice) || numPrice < 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Price must be a valid positive number'
                });
            }

            // Handle image - either from file upload or URL
            let imageUrl = image || null;
            if (req.file) {
                // File was uploaded - use the path relative to public root
                imageUrl = '/uploads/products/' + req.file.filename;
            }

            const newProduct = {
                id: Date.now(),
                name,
                description,
                price: numPrice,
                type: category,
                image: imageUrl,
                customizable: !!customizable,
                addedBy: username,
                createdAt: new Date().toISOString()
            };

            const savedProduct = await persist.addProduct(newProduct);

            // We no longer log add-product activities

            return res.json({ success: true, product: savedProduct });
        } catch (error) {
            console.error('Error adding product:', error);
            return res.status(500).json({ success: false, error: 'Failed to add product' });
        }
    },

    async removeProduct(req, res) {
        try {
            const productId = Number(req.params.id);

            if (isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid product ID'
                });
            }

            // Check if product exists before removal
            const products = await persist.getProducts();
            console.log(`Debug - Looking for product ID ${productId} (type: ${typeof productId})`);
            console.log(`Debug - Available product IDs: ${products.map(p => `${p.id} (${typeof p.id})`).join(', ')}`);

            const product = products.find(p => p.id === productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }

            await persist.removeProduct(productId);

            // We no longer log remove-product activities

            return res.json({ success: true });
        } catch (error) {
            console.error('Error removing product:', error);
            return res.status(500).json({ success: false, error: 'Failed to remove product' });
        }
    },

    async getUsers(req, res) {
        try {
            const users = await persist.loadUsers();
            // Return only safe user data (no passwords)
            const safeUsers = users.map(user => ({
                username: user.username,
                role: user.role,
                createdAt: user.createdAt
            }));
            res.json(safeUsers);
        } catch (error) {
            console.error('Error loading users:', error);
            return res.status(500).json({ success: false, error: 'Failed to load users' });
        }
    }
};