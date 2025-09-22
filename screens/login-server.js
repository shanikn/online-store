const persist = require('../persist_module');

module.exports = {
    async handleLogin(req, res) {
        try {
            const { username, password, remember } = req.body;

            // load users & find specific user
            const users = await persist.getUsers();
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                // set cookie with expiration time (12 days or 30 minutes)
                const maxAge = remember ? (12*24*60*60*1000) : (30*60*1000);
                res.cookie('userToken', username, {maxAge: maxAge});

                // log activity - standardize to required format
                await persist.logActivity(username, 'login');

                // on login success (valid input): send success response & redirect to store screen
                res.json({ success: true, redirect: '/store.html' });
            } else {
                // on login error (invalid input): send error response & display error message
                res.json({ success: false, message: 'Invalid credentials' });
            }
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    async handleLogout(req, res) {
        try {
            const username = req.cookies.userToken || null;

            // Log the logout activity before clearing the cookie
            if (username) {
                await persist.logActivity(username, 'logout');
            }

            // clear the cookie on logout (multiple ways to ensure it's cleared)
            res.clearCookie('userToken');
            res.clearCookie('userToken', { path: '/' });
            res.clearCookie('userToken', { path: '/', domain: 'localhost' });

            res.json({ success: true, redirect: '/store.html' });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
};