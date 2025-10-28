const persist = require('../persist_module');

function getCurrentUser(req) {
    return req.cookies.userToken || null;
}

// Get current user info for profile page
async function getCurrentUserInfo(req, res) {
    try {
        const username = getCurrentUser(req);
        const users = persist.getUsers();
        const user = users.find(u => u.username === username);

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        res.status(500).json({ error: 'Failed to load user info' });
    }
}

// Update user profile
async function updateProfile(req, res) {
    try {
        const oldUsername = getCurrentUser(req);
        const { newUsername } = req.body;

        // Validate required fields
        if (!newUsername) {
            return res.status(400).json({ error: 'Username is required' });
        }

        // Migrate user data
        const cart = await persist.loadCart(oldUsername);
        const wishlist = await persist.loadData('wishlists.json', {});

        await persist.saveCart(newUsername, cart);
        if (wishlist[oldUsername]) {
            wishlist[newUsername] = wishlist[oldUsername];
            delete wishlist[oldUsername];
            await persist.saveData('wishlists.json', wishlist);
        }

        // Update users and set new cookie
        const users = await persist.loadUsers();
        const userIndex = users.findIndex(u => u.username === oldUsername);
        users[userIndex] = { ...users[userIndex], username: newUsername };
        await persist.saveUsers(users);

        res.cookie('userToken', newUsername, { maxAge: 12 * 24 * 60 * 60 * 1000 });
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
}

module.exports = {
    getCurrentUserInfo,
    updateProfile
};
