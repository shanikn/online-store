const persist = require('../persist_module');

module.exports = {
    async handleRegister(req, res) {
        try {
            const { username, password, remember } = req.body;

            // load existing users
            const users = await persist.loadUsers();

            // check if username already exists
            const existingUser = users.find(u => u.username === username);
            if (existingUser) {
                return res.json({ success: false, message: 'Username already exists' });
            }

            // add new user
            const newUser = {
                username,
                password,
                email: req.body.email,
                role: 'user',
                createdAt: new Date().toISOString()
            };
            users.push(newUser);

            // save updated users
            await persist.saveUsers(users);

            // auto login the newly added user (instead of redirecting to login screen)
            const maxAge = remember ? (12*24*60*60*1000) : (30*60*1000);
            res.cookie('userToken', username, { maxAge: maxAge });

            // log the activity
            await persist.logActivity(username, 'register');

            return res.json({ success: true, redirect: '/store.html' });
        } catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }
};