const persist = require('./persist_module');

function getCurrentUser(req) {
    return req.cookies.userToken || null;
}

module.exports = {
    async getWishlist(req, res) {
        try {
            const username = getCurrentUser(req);
            const wishlist = await persist.getUserWishlist(username);
            res.json(wishlist);
        } catch (error) {
            console.error('Error loading wishlist:', error);
            res.status(500).json({ error: 'Failed to load wishlist' });
        }
    },

    async addToWishlist(req, res) {
        try {
            const username = getCurrentUser(req);
            const { productId } = req.body;

            const wishlist = await persist.getUserWishlist(username);

            if (!wishlist.includes(productId)) {
                wishlist.push(productId);
                await persist.saveUserWishlist(username, wishlist);
            }

            res.json({ success: true });
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            res.status(500).json({ error: 'Failed to add to wishlist' });
        }
    },

    async removeFromWishlist(req, res) {
        try {
            const username = getCurrentUser(req);
            const productId = parseInt(req.params.productId);

            let wishlist = await persist.getUserWishlist(username);
            wishlist = wishlist.filter(id => id !== productId);

            await persist.saveUserWishlist(username, wishlist);
            res.json({ success: true });
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            res.status(500).json({ error: 'Failed to remove from wishlist' });
        }
    }
};