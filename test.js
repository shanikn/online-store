const fetch = require('node-fetch');

// Test configuration
const BASE_URL = 'http://127.0.0.1:5000';
let testResults = [];
let testCount = 0;
let passCount = 0;

// Helper function to run a test
async function runTest(testName, testFunction) {
    testCount++;
    console.log(`\n🧪 Running Test ${testCount}: ${testName}`);
    
    try {
        await testFunction();
        console.log(`✅ PASSED: ${testName}`);
        testResults.push({ test: testName, status: 'PASSED' });
        passCount++;
    } catch (error) {
        console.log(`❌ FAILED: ${testName}`);
        console.log(`   Error: ${error.message}`);
        testResults.push({ test: testName, status: 'FAILED', error: error.message });
    }
}

// Helper function to make requests with cookies
async function makeRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    return response;
}

// Test functions
async function testServerRunning() {
    const response = await makeRequest(`${BASE_URL}/`);
    if (response.status !== 200 && !response.redirected) {
        throw new Error(`Server not responding. Status: ${response.status}`);
    }
}

async function testStaticFiles() {
    const pages = ['login.html', 'register.html', 'store.html', 'admin.html', 'readme.html'];
    
    for (const page of pages) {
        const response = await makeRequest(`${BASE_URL}/${page}`);
        if (response.status !== 200) {
            throw new Error(`${page} not accessible. Status: ${response.status}`);
        }
    }
}

async function testUserRegistration() {
    const testUser = {
        username: `testuser_${Date.now()}`,
        password: 'testpass123',
        remember: false
    };

    const response = await makeRequest(`${BASE_URL}/register`, {
        method: 'POST',
        body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(`Registration failed: ${data.message}`);
    }
}

async function testUserLogin() {
    const loginData = {
        username: 'admin',
        password: 'admin',
        remember: false
    };

    const response = await makeRequest(`${BASE_URL}/login`, {
        method: 'POST',
        body: JSON.stringify(loginData)
    });

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(`Login failed: ${data.message}`);
    }

    // Store cookie for subsequent tests
    global.authCookie = response.headers.get('set-cookie');
}

async function testInvalidLogin() {
    const loginData = {
        username: 'invaliduser',
        password: 'wrongpassword',
        remember: false
    };

    const response = await makeRequest(`${BASE_URL}/login`, {
        method: 'POST',
        body: JSON.stringify(loginData)
    });

    const data = await response.json();
    
    if (data.success) {
        throw new Error('Invalid login should have failed but succeeded');
    }
}

async function testProductsAPI() {
    const response = await makeRequest(`${BASE_URL}/api/products`, {
        headers: {
            'Cookie': global.authCookie || ''
        }
    });

    if (response.status !== 200) {
        throw new Error(`Products API failed. Status: ${response.status}`);
    }

    const products = await response.json();
    
    if (!Array.isArray(products) || products.length === 0) {
        throw new Error('Products API should return array of products');
    }

    // Verify product structure
    const product = products[0];
    const requiredFields = ['id', 'name', 'description', 'price'];
    
    for (const field of requiredFields) {
        if (!(field in product)) {
            throw new Error(`Product missing required field: ${field}`);
        }
    }
}

async function testProductSearch() {
    const response = await makeRequest(`${BASE_URL}/api/products/search?q=gold`, {
        headers: {
            'Cookie': global.authCookie || ''
        }
    });

    if (response.status !== 200) {
        throw new Error(`Product search failed. Status: ${response.status}`);
    }

    const products = await response.json();
    
    if (!Array.isArray(products)) {
        throw new Error('Search should return array of products');
    }
}

async function testAddToCart() {
    const cartData = {
        productId: 1
    };

    const response = await makeRequest(`${BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
            'Cookie': global.authCookie || ''
        },
        body: JSON.stringify(cartData)
    });

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(`Add to cart failed: ${data.error || 'Unknown error'}`);
    }
}

async function testGetCart() {
    const response = await makeRequest(`${BASE_URL}/api/cart`, {
        headers: {
            'Cookie': global.authCookie || ''
        }
    });

    if (response.status !== 200) {
        throw new Error(`Get cart failed. Status: ${response.status}`);
    }

    const cart = await response.json();
    
    if (!Array.isArray(cart)) {
        throw new Error('Cart should return array');
    }
}

async function testRemoveFromCart() {
    const response = await makeRequest(`${BASE_URL}/api/cart/remove/1`, {
        method: 'DELETE',
        headers: {
            'Cookie': global.authCookie || ''
        }
    });

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(`Remove from cart failed: ${data.error || 'Unknown error'}`);
    }
}

async function testAdminActivities() {
    const response = await makeRequest(`${BASE_URL}/api/admin/activities`, {
        headers: {
            'Cookie': global.authCookie || ''
        }
    });

    if (response.status !== 200) {
        throw new Error(`Admin activities failed. Status: ${response.status}`);
    }

    const activities = await response.json();
    
    if (!Array.isArray(activities)) {
        throw new Error('Activities should return array');
    }
}

async function testAdminActivitiesFilter() {
    const response = await makeRequest(`${BASE_URL}/api/admin/activities?filter=admin`, {
        headers: {
            'Cookie': global.authCookie || ''
        }
    });

    if (response.status !== 200) {
        throw new Error(`Admin activities filter failed. Status: ${response.status}`);
    }

    const activities = await response.json();
    
    if (!Array.isArray(activities)) {
        throw new Error('Filtered activities should return array');
    }
}

async function testAddProduct() {
    const productData = {
        name: 'Test Product',
        description: 'A test product for testing',
        price: 29.99,
        customizable: false
    };

    const response = await makeRequest(`${BASE_URL}/api/admin/products`, {
        method: 'POST',
        headers: {
            'Cookie': global.authCookie || ''
        },
        body: JSON.stringify(productData)
    });

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(`Add product failed: ${data.error || 'Unknown error'}`);
    }

    // Store product ID for deletion test
    global.testProductId = data.product?.id;
}

async function testDeleteProduct() {
    if (!global.testProductId) {
        throw new Error('No test product ID available for deletion');
    }

    const response = await makeRequest(`${BASE_URL}/api/admin/products/${global.testProductId}`, {
        method: 'DELETE',
        headers: {
            'Cookie': global.authCookie || ''
        }
    });

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(`Delete product failed: ${data.error || 'Unknown error'}`);
    }
}

async function testCheckout() {
    // First add item to cart
    await testAddToCart();
    
    const checkoutData = {
        paymentDetails: {
            cardNumber: '4111111111111111',
            expiryDate: '12/25',
            cvv: '123',
            name: 'Test User'
        }
    };

    const response = await makeRequest(`${BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: {
            'Cookie': global.authCookie || ''
        },
        body: JSON.stringify(checkoutData)
    });

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(`Checkout failed: ${data.error || 'Unknown error'}`);
    }
}

async function testContactForm() {
    const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'This is a test message'
    };

    const response = await makeRequest(`${BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
            'Cookie': global.authCookie || ''
        },
        body: JSON.stringify(contactData)
    });

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(`Contact form failed: ${data.error || 'Unknown error'}`);
    }
}

async function testWishlist() {
    const wishlistData = {
        productId: 1
    };

    const response = await makeRequest(`${BASE_URL}/api/wishlist/add`, {
        method: 'POST',
        headers: {
            'Cookie': global.authCookie || ''
        },
        body: JSON.stringify(wishlistData)
    });

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(`Add to wishlist failed: ${data.error || 'Unknown error'}`);
    }
}

async function testLogout() {
    const response = await makeRequest(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: {
            'Cookie': global.authCookie || ''
        }
    });

    const data = await response.json();
    
    if (!data.success) {
        throw new Error(`Logout failed: ${data.error || 'Unknown error'}`);
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting ShanikJewls Online Store Tests...\n');
    console.log('=' .repeat(60));
    
    // Basic functionality tests
    await runTest('Server Running', testServerRunning);
    await runTest('Static Files Accessible', testStaticFiles);
    
    // Authentication tests
    await runTest('User Registration', testUserRegistration);
    await runTest('Valid Admin Login', testUserLogin);
    await runTest('Invalid Login Rejected', testInvalidLogin);
    
    // Product tests
    await runTest('Products API', testProductsAPI);
    await runTest('Product Search', testProductSearch);
    
    // Cart functionality tests
    await runTest('Add to Cart', testAddToCart);
    await runTest('Get Cart Contents', testGetCart);
    await runTest('Remove from Cart', testRemoveFromCart);
    
    // Admin functionality tests
    await runTest('Admin Activities Log', testAdminActivities);
    await runTest('Admin Activities Filter', testAdminActivitiesFilter);
    await runTest('Admin Add Product', testAddProduct);
    await runTest('Admin Delete Product', testDeleteProduct);
    
    // Additional features tests
    await runTest('Checkout Process', testCheckout);
    await runTest('Contact Form', testContactForm);
    await runTest('Wishlist Functionality', testWishlist);
    
    // Cleanup
    await runTest('User Logout', testLogout);
    
    // Print summary
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total Tests: ${testCount}`);
    console.log(`Passed: ${passCount} ✅`);
    console.log(`Failed: ${testCount - passCount} ❌`);
    console.log(`Success Rate: ${((passCount / testCount) * 100).toFixed(1)}%`);
    
    if (passCount === testCount) {
        console.log('\n🎉 ALL TESTS PASSED! Your ShanikJewls store is working perfectly!');
    } else {
        console.log('\n⚠️  Some tests failed. Check the errors above for details.');
    }
    
    console.log('\n📋 Detailed Results:');
    testResults.forEach((result, index) => {
        const status = result.status === 'PASSED' ? '✅' : '❌';
        console.log(`${index + 1}. ${status} ${result.test}`);
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
    });
    
    process.exit(passCount === testCount ? 0 : 1);
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = { runAllTests, runTest };
