const persist = require('./persist_module');

module.exports = {
    async getActivities(req, res) {
        try {
            const activities = await persist.getAllActivities();
            const { usernamePrefix } = req.query;
            
            let filteredActivities = activities;
            if (usernamePrefix) {
                filteredActivities = activities.filter(activity => 
                    activity.username.toLowerCase().startsWith(usernamePrefix.toLowerCase())
                );
            }
            
            res.json(filteredActivities);
        } catch (error) {
            console.error('Error loading activities:', error);
            res.status(500).json({ error: 'Failed to load activities' });
        }
    },

    async getSales(req, res) {
        try {
            const users = persist.getUsers();
            let totalSales = 0;
            
            for (const user of users) {
                const purchases = await persist.getUserPurchases(user.username);
                totalSales += purchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0);
            }
            
            res.json({ totalSales: totalSales.toFixed(2) });
        } catch (error) {
            console.error('Error calculating sales:', error);
            res.status(500).json({ error: 'Failed to calculate sales' });
        }
    },

    async addProduct(req, res) {
        try {
            const products = persist.getProducts();
            const newProduct = {
                id: Date.now(),
                ...req.body
            };
            
            await persist.addProduct(newProduct);
            res.json({ success: true, product: newProduct });
        } catch (error) {
            console.error('Error adding product:', error);
            res.status(500).json({ error: 'Failed to add product' });
        }
    },

    async deleteProduct(req, res) {
        try {
            const productId = parseInt(req.params.id);
            await persist.removeProduct(productId);
            res.json({ success: true });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ error: 'Failed to delete product' });
        }
    }
};