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
        // errors like directory already exists
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
        return defaultValue;
    }
}


// file management
async function saveUsers(users){
    return await saveData('users.json', users);
}

async function loadUsers(){
    const users= await loadData('users.json', []);

    // ensure my admin user exists (with find function of JS)
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
            { id: 1, name: "gold hoop earning", description:"18k gold 3.2 cm diameter hoop earrings", price: 199.99, customizable: false}
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