const persist = require('../persist_module');

module.exports = {
    async getProducts(req, res) {
        try {
            const products = await persist.loadProducts();
            res.json(products);
        } catch (error) {
            console.error('Error loading products:', error);
            res.status(500).json({ error: 'Failed to load products' });
        }
    },

    async searchProducts(req, res) {
        try {
            const searchTerm = req.query.q || '';
            const products = await persist.loadProducts();

            if (!searchTerm) {
                return res.json(products);
            }

            const filtered = products.filter(product => {
                const name = product.name.toLowerCase();
                const description = product.description.toLowerCase();
                const search = searchTerm.toLowerCase();

                return name.includes(search) || description.includes(search);
            });

            return res.json(filtered);
        } catch (error) {
            console.error('Error searching products:', error);
            return res.status(500).json({ error: 'Failed to search products' });
        }
    }
};