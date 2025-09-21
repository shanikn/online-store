const fs = require('fs').promises;
const path = require('path');

// Data paths
const DATA_DIR = path.join(__dirname, '../data');
const USER_DATA_DIR = path.join(DATA_DIR, 'user_data');

// In-memory caches
let users = [];
let products = [];
let contacts = [];

// Initialize data loading
async function initialize() {
    try {
        await ensureDirectories();
        await loadAllData();
        console.log('Data persistence module initialized');
    } catch (error) {
        console.error('Error initializing persist module:', error);
        throw error;
    }
}

async function ensureDirectories() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
    
    try {
        await fs.access(USER_DATA_DIR);
    } catch {
        await fs.mkdir(USER_DATA_DIR, { recursive: true });
    }
}

async function loadAllData() {
    try {
        users = await loadJSON('users.json', []);
        products = await loadJSON('products.json', []);
        contacts = await loadJSON('contacts.json', []);
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

async function loadJSON(filename, defaultValue = []) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`${filename} not found, creating with default value`);
            await saveJSON(filename, defaultValue);
            return defaultValue;
        }
        throw error;
    }
}

async function saveJSON(filename, data) {
    try {
        const filePath = path.join(DATA_DIR, filename);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error saving ${filename}:`, error);
        throw error;
    }
}

// User-specific file operations
async function loadUserData(username, dataType, defaultValue = []) {
    try {
        const filename = `${username}_${dataType}.json`;
        const filePath = path.join(USER_DATA_DIR, filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Create new file for new user
            await saveUserData(username, dataType, defaultValue);
            return defaultValue;
        }
        throw error;
    }
}

async function saveUserData(username, dataType, data) {
    try {
        const filename = `${username}_${dataType}.json`;
        const filePath = path.join(USER_DATA_DIR, filename);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error saving ${filename}:`, error);
        throw error;
    }
}

async function initializeNewUser(username) {
    try {
        // Create empty files for new user
        await saveUserData(username, 'cart', []);
        await saveUserData(username, 'wishlist', []);
        await saveUserData(username, 'purchases', []);
        await saveUserData(username, 'activity', []);
        console.log(`Initialized data files for new user: ${username}`);
    } catch (error) {
        console.error(`Error initializing files for user ${username}:`, error);
        throw error;
    }
}

// Public API
module.exports = {
    initialize,
    
    // Users
    getUsers: () => users,
    addUser: async (user) => {
        users.push(user);
        await saveJSON('users.json', users);
        await initializeNewUser(user.username);
    },
    saveUsers: async () => await saveJSON('users.json', users),

    // Products
    getProducts: () => products,
    addProduct: async (product) => {
        products.push(product);
        await saveJSON('products.json', products);
    },
    removeProduct: async (productId) => {
        products = products.filter(p => p.id !== productId);
        await saveJSON('products.json', products);
    },
    saveProducts: async () => await saveJSON('products.json', products),

    // Contacts
    getContacts: () => contacts,
    addContact: async (contact) => {
        contacts.push(contact);
        await saveJSON('contacts.json', contacts);
    },

    // User-specific data
    getUserCart: async (username) => await loadUserData(username, 'cart', []),
    saveUserCart: async (username, cart) => await saveUserData(username, 'cart', cart),
    
    getUserWishlist: async (username) => await loadUserData(username, 'wishlist', []),
    saveUserWishlist: async (username, wishlist) => await saveUserData(username, 'wishlist', wishlist),
    
    getUserPurchases: async (username) => await loadUserData(username, 'purchases', []),
    saveUserPurchases: async (username, purchases) => await saveUserData(username, 'purchases', purchases),
    
    getUserActivity: async (username) => await loadUserData(username, 'activity', []),
    saveUserActivity: async (username, activity) => await saveUserData(username, 'activity', activity),
    
    // Activity logging
    logActivity: async (username, activityType, details = {}) => {
        try {
            const activity = await loadUserData(username, 'activity', []);
            activity.push({
                timestamp: new Date().toISOString(),
                username,
                activityType,
                details
            });
            await saveUserData(username, 'activity', activity);
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    },

    // Get all activities for admin
    getAllActivities: async () => {
        try {
            const allActivities = [];
            for (const user of users) {
                const userActivity = await loadUserData(user.username, 'activity', []);
                allActivities.push(...userActivity);
            }
            return allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
            console.error('Error getting all activities:', error);
            return [];
        }
    }
};