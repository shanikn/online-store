const persist = require('../persist_module');

function getCurrentUser(req) {
    return req.cookies.userToken || null;
}

module.exports = {
    async processCheckout(req, res) {
        try {
            const username = getCurrentUser(req);
            const { paymentDetails } = req.body;

            // get the current cart
            const cart = await persist.loadCart(username);
            if (cart.length == 0) {
                return res.json({ success: false, message: 'Cart is empty' });
            }

            // get cart details
            const products = await persist.loadProducts();
            let total = 0;
            const purchaseItems = cart.map(cartItem => {
                const product = products.find(p => p.id === cartItem.productId);
                const itemTotal = product.price * cartItem.quantity;
                total += itemTotal;
                return {
                    productId: cartItem.productId,
                    name: product.name,
                    price: product.price,
                    quantity: cartItem.quantity,
                    customization: cartItem.customization,
                    itemTotal
                };
            });

            // save the purchase
            await persist.savePurchase(username, {
                items: purchaseItems,
                total,
                paymentDetails
            });

            // clear cart after purchase (empty array)
            await persist.saveCart(username, []);

            res.json({ success: true, total });
        } catch (error) {
            console.error('Checkout error:', error);
            res.status(500).json({ success: false, message: 'Payment failed' });
        }
    }
};