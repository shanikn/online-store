const persist = require('../persist_module');

function getCurrentUser(req) {
    return req.cookies.userToken || null;
}

module.exports = {
    async addToCart(req, res) {
        try {
            const username = getCurrentUser(req);
            const { productId, customization } = req.body;

            console.log(`[DEBUG] Adding to cart - Username: ${username}, ProductId: ${productId} (type: ${typeof productId}), Customization:`, customization);

            // get the user cart
            const cart = await persist.loadCart(username);
            console.log(`[DEBUG] Current cart before add:`, cart);

            // For customizable items, always add as new item since each customization is unique
            if (customization && Object.keys(customization).length > 0) {
                cart.push({
                    productId,
                    quantity: 1,
                    customization,
                    addedAt: new Date().toISOString()
                });
                console.log(`[DEBUG] Added new customized item to cart`);
            } else {
                // add the new item to cart (if item already exists, add 1 to quantity)
                const existingItem = cart.find(item => item.productId === productId && !item.customization);
                if (existingItem) {
                    existingItem.quantity += 1;
                    console.log(`[DEBUG] Updated existing item quantity to ${existingItem.quantity}`);
                } else {
                    cart.push({ productId, quantity: 1, addedAt: new Date().toISOString() });
                    console.log(`[DEBUG] Added new item to cart`);
                }
            }

            // save the cart
            await persist.saveCart(username, cart);
            console.log(`[DEBUG] Cart after save:`, cart);

            // log activity
            await persist.logActivity(username, 'add-to-cart', { productId, customization });
            res.json({ success: true });
        } catch (error) {
            console.error('Error adding to cart: ', error);
            res.status(500).json({ error: 'Failed to add to cart' });
        }
    },

    async getCart(req, res) {
        try {
            const username = getCurrentUser(req);
            const cart = await persist.loadCart(username);
            console.log(`[DEBUG] Loading cart for ${username}:`, cart);
            res.json(cart);
        } catch (error) {
            res.status(500).json({ error: 'Failed to load cart' });
        }
    },

    async removeFromCart(req, res) {
        try {
            const username = getCurrentUser(req);
            const productId = parseInt(req.params.productId);

            let cart = await persist.loadCart(username);
            cart = cart.filter(item => item.productId != productId);

            await persist.saveCart(username, cart);
            await persist.logActivity(username, 'remove-from-cart', { productId });

            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed removing from cart' });
        }
    },

    async updateCart(req, res) {
        try {
            const username = getCurrentUser(req);
            const { productId, quantity } = req.body;

            let cart = await persist.loadCart(username);
            const item = cart.find(item => item.productId === productId);

            if (item) {
                if (quantity === 0) {
                    cart = cart.filter(item => item.productId !== productId);
                } else {
                    item.quantity = quantity;
                }

                await persist.saveCart(username, cart);
                await persist.logActivity(username, 'update-cart', { productId, quantity });

                res.json({ success: true });
            } else {
                res.status(400).json({ error: 'Item not found in cart' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to update cart' });
        }
    },

    async clearCart(req, res) {
        try {
            const username = getCurrentUser(req);
            await persist.saveCart(username, []);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to clear cart' });
        }
    }
};