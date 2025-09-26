const persist = require('../persist_module');

function getCurrentUser(req) {
    return req.cookies.userToken || null;
}

// Handle contact form submission
async function submitContact(req, res) {
    try {
        const { name, email, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        await persist.addContact({
            id: Date.now(),
            name,
            email,
            message,
            timestamp: new Date().toISOString(),
            from: getCurrentUser(req)
        });

        res.json({ success: true, message: 'Message sent' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
}

module.exports = {
    submitContact
};
