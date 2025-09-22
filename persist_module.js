/** data persistence
 * a module that is in charge of saving/loading data from disk (reading/writing data folder files)
 */

const fs = require('fs').promises;
const path = require('path');

// make sure the 'data' folder exists
async function ensureDataDir() {
    try {
        await fs.mkdir('data', { recursive: true });
    }
    catch (error) {
        // errors like directory already exists - can be safely ignored
        console.log('Data directory creation:', error.message);
    }
}

// file operation functions
async function saveData(filename, data) {
    try {
        await ensureDataDir();
        const filepath = path.join('data', filename);
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    }
    catch (error) {
        console.error(`Error saving ${filename}: `, error);
        throw error;
    }
}

async function loadData(filename, defaultValue = []) {
    try {
        const filepath = path.join('data', filename);
        const data = await fs.readFile(filepath, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        // file doesn't exist => return default
        console.log('File read error (using default):', error.message);
        return defaultValue;
    }
}

// file management
async function saveUsers(users) {
    return await saveData('users.json', users);
}

async function loadUsers() {
    const users = await loadData('users.json', []);

    // ensure admin user exists
    if (!users.find(u => u.username === 'admin')) {
        users.push({
            username: 'admin',
            password: 'admin',
            role: 'admin',
            createdAt: new Date().toISOString()
        });
        await saveUsers(users);
    }
    return users;
}

// Get users synchronously (for quick access)
function getUsers() {
    try {
        return require('./data/users.json');
    } catch (error) {
        console.error('Error loading users synchronously:', error);
        return [];
    }
}

// creating a new user out of input userData
async function addUser(userData) {
    const users = await loadUsers();
    const newUser = {
        username: userData.username,
        password: userData.password,
        role: 'user',
        createdAt: new Date().toISOString(),
        ...userData
    };
    users.push(newUser);
    await saveUsers(users);
    return newUser;
}

// cart management
async function saveCart(username, cartItems) {
    const carts = await loadData('carts.json', {});
    carts[username] = cartItems;
    return await saveData('carts.json', carts);
}

async function loadCart(username) {
    const carts = await loadData('carts.json', {});
    return carts[username] || [];
}

// Aliases for cart functions
async function getUserCart(username) {
    return await loadCart(username);
}

async function saveUserCart(username, cartItems) {
    return await saveCart(username, cartItems);
}

// activity logging (add new activity to file)
async function logActivity(username, activityType, details = {}) {
    const activities = await loadData('activity.json', []);
    const activity = {
        timestamp: new Date().toISOString(),
        username,
        activityType,
        details
    };
    activities.push(activity);
    await saveData('activity.json', activities);
    return activity;
}

// Get activities with optional username filter
async function getActivities(usernameFilter = null) {
    const activities = await loadData('activity.json', []);
    let filteredActivities;
    if (usernameFilter) {
        filteredActivities = activities.filter(a => a.username.startsWith(usernameFilter));
    } else {
        filteredActivities = activities;
    }

    // Sort by timestamp descending (latest first)
    return filteredActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

async function getAllActivities() {
    return await loadData('activity.json', []);
}

// product management
async function saveProducts(products) {
    return await saveData('products.json', products);
}

async function loadProducts() {
    const products = await loadData('products.json', []);

    // add default products if none exist
    if (products.length === 0) {
        const defaultProducts = [
            { id: 1, name: 'Gold Hoop Earrings', description: '18k gold 3.2cm diameter classic hoop earrings', price: 199.99, customizable: false },
            { id: 2, name: 'Silver Chain Necklace', description: 'Sterling silver 45cm delicate chain necklace', price: 89.99, customizable: true },
            // Additional default products...
        ];
        await saveProducts(defaultProducts);
        return defaultProducts;
    }
    return products;
}

// Get products synchronously
function getProducts() {
    try {
        return require('./data/products.json');
    } catch (error) {
        console.error('Error loading products synchronously:', error);
        return [];
    }
}

async function addProduct(productData) {
    const products = await loadProducts();
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    const newProduct = {
        id: newId,
        ...productData,
        createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    await saveProducts(products);
    return newProduct;
}

async function removeProduct(productId) {
    const products = await loadProducts();
    const filteredProducts = products.filter(p => p.id != parseInt(productId));
    await saveProducts(filteredProducts);
    return filteredProducts;
}

// purchase history
async function savePurchase(username, purchaseData) {
    const purchases = await loadData('purchases.json', {});

    // Initialize user's purchases array if it doesn't exist
    if (!purchases[username]) {
        purchases[username] = [];
    }

    const purchase = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        items: purchaseData.items,
        total: purchaseData.total,
        ...purchaseData
    };

    purchases[username].push(purchase);
    await saveData('purchases.json', purchases);
    return purchase;
}

async function getPurchases(username) {
    const purchases = await loadData('purchases.json', {});
    return purchases[username] || [];
}

async function getUserPurchases(username) {
    return await getPurchases(username);
}

// Wishlist management
async function getUserWishlist(username) {
    const wishlists = await loadData('wishlists.json', {});
    return wishlists[username] || [];
}

async function saveUserWishlist(username, wishlist) {
    const wishlists = await loadData('wishlists.json', {});
    wishlists[username] = wishlist;
    return await saveData('wishlists.json', wishlists);
}

// Contact form submissions
async function addContact(contactData) {
    const contacts = await loadData('contacts.json', []);
    contacts.push(contactData);
    return await saveData('contacts.json', contacts);
}

// Initialize function to create necessary data files/directories
async function initialize() {
    await ensureDataDir();
    // Ensure all required data files exist with default values
    try {
        await loadUsers(); // This creates default admin if needed
        await loadProducts(); // This creates default products if needed
        await loadData('activity.json', []); // Initialize empty activity log
        await loadData('carts.json', {}); // Initialize empty carts
        await loadData('purchases.json', {}); // Initialize empty purchases
        await loadData('wishlists.json', {}); // Initialize empty wishlists
        await loadData('contacts.json', []); // Initialize empty contacts
        console.log('✅ Data files initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing data files:', error);
        throw error;
    }
}

// initialize data directory when the module is loaded
ensureDataDir();

module.exports = {
    initialize,
    saveData,
    loadData,

    saveUsers,
    loadUsers,
    addUser,
    getUsers,

    saveCart,
    loadCart,
    getUserCart,
    saveUserCart,

    logActivity,
    getActivities,
    getAllActivities,

    saveProducts,
    loadProducts,
    addProduct,
    removeProduct,
    getProducts,

    savePurchase,
    getPurchases,
    getUserPurchases,

    getUserWishlist,
    saveUserWishlist,

    addContact
};