const persist = require('../persist_module');

function getCurrentUser(req) {
    return req.cookies.userToken || null;
}

module.exports = {
    async getActivities(req, res) {
        try {
            const usernameFilter = req.query.username || '';
            const activities = await persist.getActivities(usernameFilter);

            // Transform activities to match frontend expectations
            const transformedActivities = activities.map(activity => ({
                ...activity,
                activity: activity.activityType // Map activityType to activity field
            }));

            res.json(transformedActivities);
        } catch (error) {
            console.error('Error loading activities:', error);
            res.status(500).json({ error: 'Failed to load activities' });
        }
    },

    async addProduct(req, res) {
        try {
            const { title, description, image, price, customizable } = req.body;

            const products = await persist.loadProducts();
            const newId = Math.max(...products.map(p => p.id || 0)) + 1;

            const newProduct = {
                id: newId,
                name: title,
                description,
                image,
                price: parseFloat(price),
                customizable: customizable === 'true' || customizable === true
            };

            products.push(newProduct);
            await persist.saveProducts(products);

            await persist.logActivity(getCurrentUser(req), 'add-product', { productId: newId, title });
            res.json({ success: true, product: newProduct });
        } catch (error) {
            console.error('Error adding product:', error);
            res.status(500).json({ error: 'Failed to add product' });
        }
    },

    async removeProduct(req, res) {
        try {
            const productId = parseInt(req.params.id);

            const products = await persist.loadProducts();
            const filteredProducts = products.filter(p => p.id !== productId);

            if (products.length === filteredProducts.length) {
                return res.status(404).json({ error: 'Product not found' });
            }

            await persist.saveProducts(filteredProducts);
            await persist.logActivity(getCurrentUser(req), 'remove-product', { productId });
            res.json({ success: true });
        } catch (error) {
            console.error('Error removing product:', error);
            res.status(500).json({ error: 'Failed to remove product' });
        }
    }
};