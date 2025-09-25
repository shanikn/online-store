const persist = require('../persist_module');

function getCurrentUser(req) {
    return req.cookies.userToken || null;
}

module.exports = {
    async addToCart(req, res) {
        try {
            const username = getCurrentUser(req);
            const { productId, customization } = req.body;

            if (!productId) {
                return res.status(400).json({ success: false, error: 'Product ID is required' });
            }

            // Convert productId to number if it's a string
            const numProductId = typeof productId === 'string' ? parseInt(productId) : productId;

            // Verify product exists
            const products = await persist.getProducts();
            const product = products.find(p => p.id === numProductId);

            if (!product) {
                return res.status(404).json({ success: false, error: 'Product not found' });
            }

            const cart = await persist.getUserCart(username);

            if (customization && Object.keys(customization).length > 0) {
                const cartItemId = Date.now() + Math.random();
                cart.push({
                    cartItemId,
                    productId: numProductId,
                    quantity: 1,
                    customization,
                    addedAt: new Date().toISOString()
                });
            } else {
                const existingItem = cart.find(item => item.productId === numProductId && !item.customization);
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    const cartItemId = Date.now() + Math.random();
                    cart.push({
                        cartItemId,
                        productId: numProductId,
                        quantity: 1,
                        addedAt: new Date().toISOString()
                    });
                }
            }

            await persist.saveUserCart(username, cart);

            // Log the add-to-cart activity with the standardized type
            await persist.logActivity(username, 'add-to-cart', { productId: numProductId });

            return res.json({ success: true });
        } catch (error) {
            console.error('Error adding to cart:', error);
            return res.status(500).json({ success: false, error: 'Failed to add to cart' });
        }
    },

    async getCart(req, res) {
        try {
            const username = getCurrentUser(req);
            let cart = await persist.getUserCart(username);

            // Ensure all cart items have cartItemId
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

            // Get product details for each cart item
            const products = await persist.getProducts();
            const cartWithDetails = cart.map(item => {
                const product = products.find(p => p.id === item.productId);
                return {
                    ...item,
                    product: product ? {
                        name: product.name,
                        price: product.price,
                        description: product.description,
                        customizable: product.customizable
                    } : { name: 'Product not found', price: 0 }
                };
            });

            res.json(cartWithDetails);
        } catch (error) {
            console.error('Error loading cart:', error);
            res.status(500).json({ success: false, error: 'Failed to load cart' });
        }
    },

    async removeFromCart(req, res) {
        try {
            const username = getCurrentUser(req);

            // Get ID from either URL params or request body
            let productId;

            if (req.params.productId) {
                // ID from URL parameter
                productId = parseInt(req.params.productId);
            } else if (req.body && (req.body.productId || req.body.itemId)) {
                // ID from request body
                productId = req.body.productId ?
                    (typeof req.body.productId === 'string' ? parseInt(req.body.productId) : req.body.productId) :
                    null;
            } else {
                // No ID provided
                return res.status(400).json({
                    success: false,
                    error: 'Product ID is required to remove item from cart'
                });
            }

            let cart = await persist.getUserCart(username);
            const initialCartSize = cart.length;

            // Try to find item by productId first
            if (productId) {
                cart = cart.filter(item => item.productId !== productId);
            }

            // If nothing was removed and body has itemId, try that
            if (cart.length === initialCartSize && req.body && req.body.itemId) {
                const cartItemId = parseFloat(req.body.itemId);
                cart = cart.filter(item => item.cartItemId !== cartItemId);
            }

            // If still nothing removed, return error
            if (cart.length === initialCartSize) {
                return res.status(404).json({
                    success: false,
                    error: 'Item not found in cart'
                });
            }

            await persist.saveUserCart(username, cart);
            return res.json({ success: true });
        } catch (error) {
            console.error('Error removing from cart:', error);
            return res.status(500).json({ success: false, error: 'Failed removing from cart' });
        }
    },

    async updateCart(req, res) {
        try {
            const username = getCurrentUser(req);
            const { itemId, quantity } = req.body;

            if (quantity === undefined) {
                return res.status(400).json({ success: false, error: 'Quantity is required' });
            }

            let cart = await persist.getUserCart(username);
            const itemIdAsNumber = parseFloat(itemId);

            let item = cart.find(cartItem => cartItem.cartItemId === itemIdAsNumber);
            if (!item) {
                const productId = parseInt(itemId);
                item = cart.find(cartItem => cartItem.productId === productId);
            }

            if (item) {
                if (quantity === 0) {
                    cart = cart.filter(cartItem =>
                        cartItem.cartItemId !== itemIdAsNumber &&
                        cartItem.productId !== parseInt(itemId)
                    );
                } else {
                    item.quantity = quantity;
                }

                await persist.saveUserCart(username, cart);
                return res.json({ success: true });
            } else {
                return res.status(400).json({ success: false, error: 'Item not found in cart' });
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            return res.status(500).json({ success: false, error: 'Failed to update cart' });
        }
    },

    async clearCart(req, res) {
        try {
            const username = getCurrentUser(req);
            await persist.saveUserCart(username, []);
            res.json({ success: true });
        } catch (error) {
            console.error('Error clearing cart:', error);
            res.status(500).json({ success: false, error: 'Failed to clear cart' });
        }
    },

    async updateCustomization(req, res) {
        try {
            const username = getCurrentUser(req);
            const { cartItemId, customization } = req.body;

            if (!cartItemId) {
                return res.status(400).json({ success: false, error: 'Cart item ID is required' });
            }

            const cart = await persist.getUserCart(username);
            const item = cart.find(item => item.cartItemId === parseFloat(cartItemId));

            if (item) {
                item.customization = customization;
                item.lastModified = new Date().toISOString();

                await persist.saveUserCart(username, cart);
                return res.json({ success: true });
            } else {
                return res.status(404).json({ success: false, error: 'Item not found in cart' });
            }
        } catch (error) {
            console.error('Error updating customization:', error);
            return res.status(500).json({ success: false, error: 'Failed to update customization' });
        }
    }
};