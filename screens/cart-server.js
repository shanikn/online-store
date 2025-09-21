const persist = require('./persist_module');

function getCurrentUser(req) {
    return req.cookies.userToken || null;
}

module.exports = {
    async addToCart(req, res) {
        try {
            const username = getCurrentUser(req);
            const { productId, customization } = req.body;

            const cart = await persist.getUserCart(username);

            if (customization && Object.keys(customization).length > 0) {
                const cartItemId = Date.now() + Math.random();
                cart.push({
                    cartItemId,
                    productId,
                    quantity: 1,
                    customization,
                    addedAt: new Date().toISOString()
                });
            } else {
                const existingItem = cart.find(item => item.productId === productId && !item.customization);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    const cartItemId = Date.now() + Math.random();
                    cart.push({ cartItemId, productId, quantity: 1, addedAt: new Date().toISOString() });
                }
            }

            await persist.saveUserCart(username, cart);
            await persist.logActivity(username, 'add-to-cart', { productId, customization });
            res.json({ success: true });
        } catch (error) {
            console.error('Error adding to cart:', error);
            res.status(500).json({ error: 'Failed to add to cart' });
        }
    },

    async getCart(req, res) {
        try {
            const username = getCurrentUser(req);
            let cart = await persist.getUserCart(username);

            let cartUpdated = false;
            cart = cart.map(item => {
                if (!item.cartItemId) {
                    item.cartItemId = Date.now() + Math.random();
                    cartUpdated = true;
                }
                return item;
            });

            if (cartUpdated) {
                await persist.saveUserCart(username, cart);
            }

            res.json(cart);
        } catch (error) {
            console.error('Error loading cart:', error);
            res.status(500).json({ error: 'Failed to load cart' });
        }
    },

    async removeFromCart(req, res) {
        try {
            const username = getCurrentUser(req);
            const cartItemId = parseFloat(req.body.itemId);

            let cart = await persist.getUserCart(username);
            cart = cart.filter(item => item.cartItemId !== cartItemId);

            await persist.saveUserCart(username, cart);
            res.json({ success: true });
        } catch (error) {
            console.error('Error removing from cart:', error);
            res.status(500).json({ error: 'Failed removing from cart' });
        }
    },

    async updateCart(req, res) {
        try {
            const username = getCurrentUser(req);
            const { itemId, quantity } = req.body;

            let cart = await persist.getUserCart(username);
            const itemIdAsNumber = parseFloat(itemId);

            let item = cart.find(cartItem => cartItem.cartItemId === itemIdAsNumber);
            if (!item) {
                item = cart.find(cartItem => cartItem.productId === itemIdAsNumber);
            }

            if (item) {
                if (quantity === 0) {
                    cart = cart.filter(cartItem =>
                        cartItem.cartItemId !== itemIdAsNumber && cartItem.productId !== itemIdAsNumber
                    );
                } else {
                    item.quantity = quantity;
                }

                await persist.saveUserCart(username, cart);
                res.json({ success: true });
            } else {
                res.status(400).json({ error: 'Item not found in cart' });
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            res.status(500).json({ error: 'Failed to update cart' });
        }
    },

    async clearCart(req, res) {
        try {
            const username = getCurrentUser(req);
            await persist.saveUserCart(username, []);
            res.json({ success: true });
        } catch (error) {
            console.error('Error clearing cart:', error);
            res.status(500).json({ error: 'Failed to clear cart' });
        }
    },

    async updateCustomization(req, res) {
        try {
            const username = getCurrentUser(req);
            const { cartItemId, customization } = req.body;

            let cart = await persist.getUserCart(username);
            const item = cart.find(item => item.cartItemId === cartItemId);

            if (item) {
                item.customization = customization;
                item.lastModified = new Date().toISOString();

                await persist.saveUserCart(username, cart);
                res.json({ success: true });
            } else {
                res.status(400).json({ error: 'Item not found in cart' });
            }
        } catch (error) {
            console.error('Error updating customization:', error);
            res.status(500).json({ error: 'Failed to update customization' });
        }
    }
};