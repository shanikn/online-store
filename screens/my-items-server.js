// Simple module that reuses existing purchase logic
// The actual purchase data loading is already handled in server.js via /api/purchases

const persist = require('../persist_module');

function getCurrentUser(req) {
    return req.cookies.userToken || null;
}

module.exports = {
    // This can be a simple wrapper around the existing /api/purchases endpoint
    // Or we can add my-items specific functionality here if needed later

    async getPurchases(req, res) {
        try {
            const username = getCurrentUser(req);
            const purchases = await persist.getPurchases(username);
            res.json(purchases);
        } catch (error) {
            console.error('Error loading purchases:', error);
            res.status(500).json({ error: 'Failed to load purchases' });
        }
    }
};
