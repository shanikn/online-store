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
                const cartItemId = Date.now() + Math.random(); // Generate unique ID
                cart.push({
                    cartItemId,
                    productId,
                    quantity: 1,
                    customization,
                    addedAt: new Date().toISOString()
                });
                console.log(`[DEBUG] Added new customized item to cart with ID: ${cartItemId}`);
            } else {
                // add the new item to cart (if item already exists, add 1 to quantity)
                const existingItem = cart.find(item => item.productId === productId && !item.customization);
                if (existingItem) {
                    existingItem.quantity += 1;
                    console.log(`[DEBUG] Updated existing item quantity to ${existingItem.quantity}`);
                } else {
                    const cartItemId = Date.now() + Math.random(); // Generate unique ID
                    cart.push({ cartItemId, productId, quantity: 1, addedAt: new Date().toISOString() });
                    console.log(`[DEBUG] Added new item to cart with ID: ${cartItemId}`);
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
            let cart = await persist.loadCart(username);

            // Migration: Add cartItemId to existing items that don't have it
            let cartUpdated = false;
            cart = cart.map(item => {
                if (!item.cartItemId) {
                    item.cartItemId = Date.now() + Math.random();
                    cartUpdated = true;
                    console.log(`[DEBUG] Added cartItemId ${item.cartItemId} to existing item with productId ${item.productId}`);
                }
                return item;
            });

            // Save the cart if we added any cartItemIds
            if (cartUpdated) {
                await persist.saveCart(username, cart);
                console.log(`[DEBUG] Updated cart with cartItemIds for ${username}`);
            }

            console.log(`[DEBUG] Loading cart for ${username}:`, cart);
            res.json(cart);
        } catch (error) {
            console.error('Error loading cart:', error);
            res.status(500).json({ error: 'Failed to load cart' });
        }
    },

    async removeFromCart(req, res) {
        try {
            const username = getCurrentUser(req);
            const cartItemId = parseFloat(req.params.cartItemId); // Use cartItemId instead of productId

            let cart = await persist.loadCart(username);

            console.log(`[DEBUG] Attempting to remove cartItemId: ${cartItemId}`);
            console.log(`[DEBUG] Current cart:`, cart.map(item => ({ productId: item.productId, cartItemId: item.cartItemId, customization: item.customization })));

            const itemToRemove = cart.find(item => item.cartItemId === cartItemId);
            console.log(`[DEBUG] Item to remove:`, itemToRemove);

            cart = cart.filter(item => item.cartItemId !== cartItemId);
            console.log(`[DEBUG] Cart after removal:`, cart.map(item => ({ productId: item.productId, cartItemId: item.cartItemId, customization: item.customization })));

            await persist.saveCart(username, cart);
            await persist.logActivity(username, 'remove-from-cart', { productId: itemToRemove?.productId, cartItemId });

            res.json({ success: true });
        } catch (error) {
            console.error('Error removing from cart:', error);
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
            console.error('Error updating cart:', error);
            res.status(500).json({ error: 'Failed to update cart' });
        }
    },

    async clearCart(req, res) {
        try {
            const username = getCurrentUser(req);
            await persist.saveCart(username, []);
            res.json({ success: true });
        } catch (error) {
            console.error('Error clearing cart:', error);
            res.status(500).json({ error: 'Failed to clear cart' });
        }
    },

    async updateCustomization(req, res) {
        try {
            const username = getCurrentUser(req);
            const { productId, customization } = req.body;

            console.log(`[DEBUG] Updating customization - Username: ${username}, ProductId: ${productId}, Customization:`, customization);

            let cart = await persist.loadCart(username);

            // Find the item in cart by productId
            const item = cart.find(item => item.productId === productId);

            if (item) {
                // Update the customization
                item.customization = customization;
                item.lastModified = new Date().toISOString();

                await persist.saveCart(username, cart);
                await persist.logActivity(username, 'update-customization', { productId, customization });

                console.log(`[DEBUG] Customization updated successfully`);
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