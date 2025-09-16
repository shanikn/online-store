/** data persistence 
 * a module that is in charge of saving/loading data from disk (reading/writing data folder files)
 * used inside server.js and inside screen modules when i need to save/load data from files
 * 
 * i need to implement I/O functions
 */

const fs= require('fs').promises;
const path= require('path');

// make sure the 'data' folder exists
async function ensureDataDir(){
    try{
        await fs.mkdir('data', { recursive: true});
    }
    catch(error){
        // errors like directory already exists - can be safely ignored
        console.log('Data directory creation:', error.message);
    }
}

// file operation functions
async function saveData(filename, data){
    try{
        await ensureDataDir();
        const filepath= path.join('data', filename);
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));

    }
    catch(error){
        console.error('Error saving ${filename}: ', error);
        throw error;
    }
}

async function loadData(filename, defaultValue= []){
    try{
        const filepath= path.join('data', filename);
        const data= await fs.readFile(filepath, 'utf8');
        return JSON.parse(data);
    }
    catch(error){
        // file doesn't exist=> return default
        console.log('File read error (using default):', error.message);
        return defaultValue;
    }
}


// file management
async function saveUsers(users){
    return await saveData('users.json', users);
}

async function loadUsers(){
    const users= await loadData('users.json', []);

    // ensure my admin user exists and create it if it doesn't!!! (with find() function of JS)
    if(!users.find(u=> u.username==='admin')){
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

// creating a new user out of input userData
async function addUser(userData){
    const users= await loadUsers();
    const newUser= {
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


// cart managemnet
async function saveCart(username, cartItems){
    const carts= await loadData('carts.json', {});
    carts[username]= cartItems;
    return await saveData('carts.json', carts);
}

async function loadCart(username){
    const carts= await loadData('carts.json', {});
    return carts[username] || [];
}

// activity logging (add new activity to file)
async function logActivity(username, activityType, details={}){
    const activities= await loadData('activity.json', []);
    const activity= {
        timestamp: new Date().toISOString(),
        username,
        activityType,
        details
    };
    activities.push(activity);
    await saveData('activity.json', activities);
    return activity;
}

// whats usernameFilter? (the default is null)
async function getActivities(usernameFilter= null){
    const activities= await loadData('activity.json', []);
    if(usernameFilter){
        return activities.filter(a=> a.username.startsWith(usernameFilter));
    }
    return activities;
}


// product management
async function saveProducts(products){
    return await saveData('products.json', products);
}

async function loadProducts(){
    const products= await loadData('products.json', []);

    // add default products (in case there are none, like at first time running)
    if(products.length==0){
        const defaultProducts= [
            { id: 1, name: "Gold Hoop Earrings", description:"18k gold 3.2cm diameter classic hoop earrings", price: 199.99, customizable: false},
            { id: 2, name: "Silver Chain Necklace", description:"Sterling silver 45cm delicate chain necklace", price: 89.99, customizable: true},
            { id: 3, name: "Gold Diamond Ring", description:"14k gold solitaire ring with 0.5ct diamond", price: 899.99, customizable: true},
            { id: 4, name: "Silver Stud Earrings", description:"Sterling silver cubic zirconia stud earrings", price: 45.99, customizable: false},
            { id: 5, name: "Gold Tennis Bracelet", description:"18k gold tennis bracelet with crystal stones", price: 299.99, customizable: false},
            { id: 6, name: "Silver Pendant Necklace", description:"Sterling silver heart pendant with chain", price: 69.99, customizable: true},
            { id: 7, name: "Gold Stackable Rings", description:"14k gold thin stackable rings set of 3", price: 149.99, customizable: true},
            { id: 8, name: "Silver Cuff Bracelet", description:"Sterling silver adjustable cuff bracelet", price: 79.99, customizable: false},
            { id: 9, name: "Gold Drop Earrings", description:"18k gold elegant drop earrings with pearls", price: 249.99, customizable: false},
            { id: 10, name: "Silver Charm Bracelet", description:"Sterling silver charm bracelet with 5 charms", price: 119.99, customizable: true},
            { id: 11, name: "Gold Infinity Necklace", description:"14k gold infinity symbol pendant necklace", price: 179.99, customizable: true},
            { id: 12, name: "Silver Statement Ring", description:"Sterling silver large statement ring with stones", price: 95.99, customizable: false},
            { id: 13, name: "Gold Ankle Bracelet", description:"18k gold delicate ankle chain bracelet", price: 129.99, customizable: false},
            { id: 14, name: "Silver Pearl Earrings", description:"Sterling silver freshwater pearl drop earrings", price: 85.99, customizable: false},
            { id: 15, name: "Gold Vintage Ring", description:"14k gold vintage-style engagement ring", price: 699.99, customizable: true},
            { id: 16, name: "Silver Choker Necklace", description:"Sterling silver adjustable choker necklace", price: 55.99, customizable: false},
            { id: 17, name: "Gold Bangle Set", description:"18k gold thin bangle bracelets set of 4", price: 329.99, customizable: false}
        ];
        await saveProducts(defaultProducts);
        return defaultProducts;
    }
    return products;
}


async function addProduct(productData){
    const products= await loadProducts();
    const newId= Math.max(...products.map(p=> p.id), 0)+1;
    const newProduct= {
        id: newId,
        ...productData,
        createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    await saveProducts(products);
    return newProduct;
}


async function removeProduct(productId){
    const products= await loadProducts();
    const filteredProducts= products.filter(p=> p.id!=parseInt(productId));
    await saveProducts(filteredProducts);
    return filteredProducts;
}


// purchase history
async function savePurchase(username, purchaseData){
    const purchases= await loadData('purchases.json', {});
    
    // if the user has made no purchases, set it to be empty
    if(!purchases[username]){
        purchases[username]=[];
    }

    const purchase= {
        id: Date.now(),
        timeStamp: new Date().toISOString(),
        items: purchaseData.items,
        total: purchaseData.total,
        ...purchaseData
    };

    purchases[username].push(purchase);
    await saveData('purchases.json', purchases);
    return purchase;
}


async function getPurchases(username){
    const purchases= await loadData('purchases.json', {});
    return purchases[username] || [];
}

// initialize data directory when the module is loaded
ensureDataDir();

module.exports= {
    saveData,
    loadData,

    saveUsers,
    loadUsers,
    addUser,

    saveCart,
    loadCart,

    logActivity,
    getActivities,

    saveProducts,
    loadProducts,
    addProduct,
    removeProduct,

    savePurchase,
    getPurchases
};