const persist = require('../persist_module');

function getCurrentUser(req) {
    return req.cookies.userToken || null;
}

// Get user's wishlist with full product details
async function getWishlist(req, res) {
    try {
        const username = getCurrentUser(req);
        const userWishlistIds = await persist.getUserWishlist(username);
        const products = persist.getProducts();
        const wishlistItems = products.filter(product => userWishlistIds.includes(product.id));

        res.json(wishlistItems);
    } catch (error) {
        console.error('Error loading wishlist:', error);
        res.status(500).json({ error: 'Failed to load wishlist' });
    }
}

// Add product to wishlist
async function addToWishlist(req, res) {
    try {
        const username = getCurrentUser(req);
        const { productId } = req.body;

        const numProductId = typeof productId === 'string' ? parseInt(productId) : productId;

        // Validate that the product exists
        const products = await persist.getProducts();
        const productExists = products.some(p => p.id === numProductId);

        if (!productExists) {
            return res.status(400).json({
                success: false,
                error: 'Product not found'
            });
        }

        const wishlist = await persist.getUserWishlist(username);

        if (!wishlist.includes(numProductId)) {
            wishlist.push(numProductId);
            await persist.saveUserWishlist(username, wishlist);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
}

// Remove product from wishlist
async function removeFromWishlist(req, res) {
    try {
        const username = getCurrentUser(req);
        const productId = req.body.productId;

        if (!productId) {
            return res.status(400).json({ success: false, error: 'Product ID is required' });
        }

        // Get current wishlist
        const userWishlist = await persist.getUserWishlist(username);

        // Convert to number for consistent comparison
        const numProductId = typeof productId === 'string' ? parseInt(productId) : productId;

        // Remove the product from wishlist
        const updatedWishlist = userWishlist.filter(id => {
            const numId = typeof id === 'string' ? parseInt(id) : id;
            return numId !== numProductId;
        });

        // Save the updated wishlist
        await persist.saveUserWishlist(username, updatedWishlist);

        return res.json({ success: true });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return res.status(500).json({ success: false, error: 'Failed to remove from wishlist' });
    }
}

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist
};
