const persist = require('../persist_module');

module.exports = {
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
            const users = await persist.getUsers();
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
            const { name, description, price, customizable } = req.body;

            // Validate required fields
            if (!name || !description || price === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Product requires name, description, and price'
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

            const newProduct = {
                id: Date.now(),
                name,
                description,
                price: numPrice,
                customizable: !!customizable,
                addedBy: username,
                createdAt: new Date().toISOString()
            };

            await persist.addProduct(newProduct);

            // We no longer log add-product activities

            res.json({ success: true, product: newProduct });
        } catch (error) {
            console.error('Error adding product:', error);
            res.status(500).json({ success: false, error: 'Failed to add product' });
        }
    },

    async removeProduct(req, res) {
        try {
            const username = req.cookies.userToken || null;
            const productId = parseInt(req.params.id);

            if (isNaN(productId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid product ID'
                });
            }

            // Check if product exists before removal
            const products = await persist.getProducts();
            const product = products.find(p => p.id === productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }

            await persist.removeProduct(productId);

            // We no longer log remove-product activities

            res.json({ success: true });
        } catch (error) {
            console.error('Error removing product:', error);
            res.status(500).json({ success: false, error: 'Failed to remove product' });
        }
    }
};