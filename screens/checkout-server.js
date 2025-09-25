const persist = require('../persist_module');

function getCurrentUser(req) {
    return req.cookies.userToken || null;
}

module.exports = {
    async processCheckout(req, res) {
        try {
            const username = getCurrentUser(req);
            const {
                items,
                fullName,
                email,
                phone,
                address,
                city,
                zipCode,
                country,
                cardName,
                cardNumber,
                expiry,
                cvv
            } = req.body;

            // Validate cart items
            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No items selected for checkout'
                });
            }

            // Validate required shipping fields
            if (!fullName || !email || !phone || !address || !city || !zipCode) {
                return res.status(400).json({
                    success: false,
                    message: 'Please fill in all required shipping fields'
                });
            }

            // Validate payment information
            if (!cardName || !cardNumber || !expiry || !cvv) {
                return res.status(400).json({
                    success: false,
                    message: 'Please complete payment information'
                });
            }

            // Get products to calculate accurate totals
            const products = await persist.loadProducts();
            let calculatedTotal = 0;
            const purchaseItems = items.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) {
                    throw new Error(`Product not found: ${item.productId}`);
                }
                const itemTotal = product.price * item.quantity;
                calculatedTotal += itemTotal;
                return {
                    productId: item.productId,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    customization: item.customization,
                    itemTotal
                };
            });

            // Create purchase record
            const purchaseData = {
                items: purchaseItems,
                total: calculatedTotal,
                customerInfo: {
                    fullName,
                    email,
                    phone,
                    address,
                    city,
                    zipCode,
                    country
                },
                paymentInfo: {
                    cardName,
                    cardLast4: cardNumber.slice(-4), // Only store last 4 digits
                    expiry
                },
                orderDate: new Date().toISOString()
            };

            // Log activity
            await persist.logActivity(username, 'purchase', {
                total: calculatedTotal.toFixed(2),
                itemCount: items.length
            });

            // Save the purchase
            await persist.savePurchase(username, purchaseData);

            // Remove purchased items from cart
            const fullCart = await persist.loadCart(username);
            const remainingCart = fullCart.filter(cartItem => {
                // Check if this cart item was purchased
                return !items.some(selectedItem => {
                    // Match by cartItemId (preferred) or fallback to productId + customization
                    if (selectedItem.cartItemId && cartItem.cartItemId) {
                        return selectedItem.cartItemId === cartItem.cartItemId;
                    }
                    // Fallback matching for items without cartItemId
                    const productMatch = selectedItem.productId === cartItem.productId;
                    const customizationMatch = JSON.stringify(selectedItem.customization || {}) ===
                                               JSON.stringify(cartItem.customization || {});
                    return productMatch && customizationMatch;
                });
            });

            await persist.saveCart(username, remainingCart);

            return res.json({ success: true, total: calculatedTotal });
        } catch (error) {
            console.error('Checkout error:', error);
            return res.status(500).json({
                success: false,
                message: 'Payment processing failed. Please try again.'
            });
        }
    }
};