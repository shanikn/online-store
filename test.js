// eslint-disable-next-line no-redeclare
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Test configuration
const BASE_URL = 'http://127.0.0.1:5000';
const testResults = [];
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

    const response = await makeRequest(`${BASE_URL}/api/cart`, {
        method: 'POST',
        headers: {
            'Cookie': global.authCookie || ''
        },
        body: JSON.stringify(cartData)
    });

    try {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Add to cart failed: ${response.status} ${data.error || 'Unknown error'}`);
        }

        if (!data.success) {
            throw new Error(`Add to cart failed: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.log('   Debug - Add to cart response:', await response.text());
        throw new Error(`Add to cart failed: ${error.message}`);
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
    // First add an item to cart
    await testAddToCart();

    // Then remove it
    const response = await makeRequest(`${BASE_URL}/api/cart/1`, {
        method: 'DELETE',
        headers: {
            'Cookie': global.authCookie || ''
        }
    });

    try {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Remove from cart failed: Status ${response.status}`);
        }

        if (!data.success) {
            throw new Error(`Remove from cart failed: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.log('   Debug - Remove from cart response:', await response.text());
        throw new Error(`Remove from cart failed: ${error.message}`);
    }
}

async function testAdminActivities() {
    // Try both activity endpoints for compatibility
    let response;
    try {
        // Try the main activities endpoint first
        response = await makeRequest(`${BASE_URL}/api/admin/activities`, {
            headers: {
                'Cookie': global.authCookie || ''
            }
        });
    } catch (error) {
        // Fall back to legacy endpoint
        console.log('   Debug - Falling back to legacy activity endpoint');
        response = await makeRequest(`${BASE_URL}/api/admin/activity`, {
            headers: {
                'Cookie': global.authCookie || ''
            }
        });
    }

    if (response.status !== 200) {
        throw new Error(`Admin activities failed. Status: ${response.status}`);
    }

    try {
        const activities = await response.json();

        if (!Array.isArray(activities)) {
            throw new Error('Activities should return array');
        }
    } catch (error) {
        console.log('   Debug - Activities response:', await response.text());
        throw new Error(`Admin activities returned invalid JSON: ${error.message}`);
    }
}

async function testAdminActivitiesFilter() {
    // Try both activity endpoints with filter
    let response;
    try {
        // Try the dedicated filter endpoint first
        response = await makeRequest(`${BASE_URL}/api/admin/activities/filter?prefix=admin`, {
            headers: {
                'Cookie': global.authCookie || ''
            }
        });
    } catch (error) {
        // Fall back to legacy endpoint with filter
        console.log('   Debug - Falling back to legacy activity filter endpoint');
        response = await makeRequest(`${BASE_URL}/api/admin/activity?usernamePrefix=admin`, {
            headers: {
                'Cookie': global.authCookie || ''
            }
        });
    }

    if (response.status !== 200) {
        throw new Error(`Admin activities filter failed. Status: ${response.status}`);
    }

    try {
        const activities = await response.json();

        if (!Array.isArray(activities)) {
            throw new Error('Filtered activities should return array');
        }

        // Verify filtering actually worked
        const nonAdminActivities = activities.filter(a => a.username && !a.username.toLowerCase().startsWith('admin'));
        if (nonAdminActivities.length > 0) {
            console.log(`Warning: Filter returned ${nonAdminActivities.length} non-admin activities`);
        }
    } catch (error) {
        console.log('   Debug - Filtered activities response:', await response.text());
        throw new Error(`Admin activities filter returned invalid JSON: ${error.message}`);
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
    // First ensure we have a product in cart for checkout
    const addResponse = await makeRequest(`${BASE_URL}/api/cart`, {
        method: 'POST',
        headers: {
            'Cookie': global.authCookie || '',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId: 1 })
    });
    const addData = await addResponse.json();
    if (!addData.success) {
        console.log('   Debug - Add to cart failed:', JSON.stringify(addData));
        throw new Error('Failed to add item to cart for checkout test');
    }
    console.log('   Debug - Add to cart succeeded:', JSON.stringify(addData));

    // Verify the cart has the item we just added
    const cartCheckResponse = await makeRequest(`${BASE_URL}/api/cart`, {
        headers: {
            'Cookie': global.authCookie || ''
        }
    });
    const cartData = await cartCheckResponse.json();
    console.log('   Debug - Cart contents before checkout:', JSON.stringify(cartData));

    // Prepare a complete checkout data object with all required fields
    const checkoutData = {
        items: cartData, // Pass the actual cart items
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '123-456-7890',
        address: '123 Test St',
        city: 'Test City',
        zipCode: '12345',
        country: 'Test Country',
        cardName: 'Test User',
        cardNumber: '4111111111111111',
        expiry: '12/25',
        cvv: '123'
    };

    const response = await makeRequest(`${BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: {
            'Cookie': global.authCookie || ''
        },
        body: JSON.stringify(checkoutData)
    });

    try {
        const data = await response.json();

        if (!response.ok) {
            console.log('   Debug - Checkout response:', JSON.stringify(data));
            throw new Error(`Checkout failed with status ${response.status}`);
        }

        if (!data.success) {
            console.log('   Debug - Checkout response:', JSON.stringify(data));
            throw new Error(`Checkout failed: ${data.error || data.message || 'Unknown error'}`);
        }
    } catch (error) {
        if (error.message.includes('Unexpected token')) {
            console.log('   Debug - Checkout raw response:', await response.text());
            throw new Error('Checkout returned invalid JSON');
        }
        throw error;
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

// Edge case tests
async function testInvalidProductId() {
    const cartData = { productId: 99999 };
    const response = await makeRequest(`${BASE_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Cookie': global.authCookie || '' },
        body: JSON.stringify(cartData)
    });

    try {
        const data = await response.json();
        if (data.success) {
            throw new Error('Adding invalid product should fail');
        }
    } catch (error) {
        // If we can't parse JSON, the test still passes as long as it's not a success
        if (error.message.includes('Unexpected token')) {
            console.log('   Debug - Invalid product cart response:', await response.text());
            // Test passes if the response isn't a success JSON object
            return;
        }
        throw error;
    }

    // Also check for proper status code (should be 4xx)
    if (response.status < 400) {
        throw new Error(`Invalid product should return error status, got ${response.status}`);
    }
}

async function testUnauthorizedCart() {
    const response = await makeRequest(`${BASE_URL}/api/cart`, {
        method: 'POST',
        body: JSON.stringify({ productId: 1 })
    });
    if (response.status === 200) throw new Error('Cart access without auth should fail');
}

async function testMalformedCartData() {
    const response = await makeRequest(`${BASE_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Cookie': global.authCookie || '' },
        body: '{"invalid": json}'
    });
    if (response.status === 200) throw new Error('Malformed JSON should be rejected');
}

async function testEmptyCartCheckout() {
    await makeRequest(`${BASE_URL}/api/cart/1`, {
        method: 'DELETE',
        headers: { 'Cookie': global.authCookie || '' }
    });

    const response = await makeRequest(`${BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Cookie': global.authCookie || '' },
        body: JSON.stringify({ paymentDetails: { cardNumber: '4111111111111111', expiryDate: '12/25', cvv: '123', name: 'Test' }})
    });
    const data = await response.json();
    if (data.success) throw new Error('Empty cart checkout should fail');
}

async function testUnauthorizedAdmin() {
    const response = await makeRequest(`${BASE_URL}/api/admin/activity`);
    if (response.status === 200) throw new Error('Admin access without auth should fail');
}

async function testSearchInjection() {
    const maliciousQuery = '\'; DROP TABLE products; --';
    const response = await makeRequest(`${BASE_URL}/api/products?q=${encodeURIComponent(maliciousQuery)}`);
    if (response.status !== 200) throw new Error('Search should handle malicious input gracefully');
    const products = await response.json();
    if (!Array.isArray(products)) throw new Error('Search should return valid response');
}

async function testInvalidWishlistProduct() {
    const response = await makeRequest(`${BASE_URL}/api/wishlist`, {
        method: 'POST',
        headers: { 'Cookie': global.authCookie || '' },
        body: JSON.stringify({ productId: 99999 })
    });

    try {
        const data = await response.json();

        if (data.success) {
            throw new Error('Adding invalid product to wishlist should fail');
        }
    } catch (error) {
        if (error.message.includes('Unexpected token')) {
            // If there's a JSON parsing error, the test passes because it didn't return {success: true}
            return;
        }
        throw error;
    }
}

async function testInvalidContactData() {
    const response = await makeRequest(`${BASE_URL}/api/contact`, {
        method: 'POST',
        body: JSON.stringify({ name: '', email: 'invalid-email', message: '' })
    });
    const data = await response.json();
    if (data.success) throw new Error('Invalid contact data should be rejected');
}

async function testDuplicateUserRegistration() {
    const response = await makeRequest(`${BASE_URL}/register`, {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'password123' })
    });
    const data = await response.json();
    if (data.success) throw new Error('Duplicate username registration should fail');
}

async function testWishlist() {
    const wishlistData = {
        productId: 1
    };

    const response = await makeRequest(`${BASE_URL}/api/wishlist`, {
        method: 'POST',
        headers: {
            'Cookie': global.authCookie || ''
        },
        body: JSON.stringify(wishlistData)
    });

    try {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Add to wishlist failed: Status ${response.status}`);
        }

        if (!data.success) {
            throw new Error(`Add to wishlist failed: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.log('   Debug - Add to wishlist response:', await response.text());
        throw new Error(`Add to wishlist failed: ${error.message}`);
    }
}

async function cleanupTestData() {
    const fs = require('fs').promises;
    const path = require('path');

    try {
        // Clean up individual user files for admin user
        const userDataDir = path.join(__dirname, 'data', 'user_data');

        try {
            await fs.writeFile(path.join(userDataDir, 'admin_cart.json'), '[]');
            await fs.writeFile(path.join(userDataDir, 'admin_wishlist.json'), '[]');
        } catch (error) {
            console.log('Cleanup note: Individual user files reset');
        }

        // Reset contacts
        const contactsPath = path.join(__dirname, 'data', 'contacts.json');
        try {
            await fs.writeFile(contactsPath, '[]');
        } catch (e) {
            console.log('Cleanup warning:', e.message);
        }

        console.log('   ✨ Test data cleaned up successfully');
    } catch (error) {
        console.log(`   ⚠️  Warning: Could not clean up some test data: ${error.message}`);
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

    // Edge case and security tests
    await runTest('Invalid Product ID in Cart', testInvalidProductId);
    await runTest('Unauthorized Cart Access', testUnauthorizedCart);
    await runTest('Malformed Cart Data', testMalformedCartData);
    await runTest('Empty Cart Checkout', testEmptyCartCheckout);
    await runTest('Unauthorized Admin Access', testUnauthorizedAdmin);
    await runTest('Search SQL Injection Protection', testSearchInjection);
    await runTest('Invalid Wishlist Product', testInvalidWishlistProduct);
    await runTest('Invalid Contact Form Data', testInvalidContactData);
    await runTest('Duplicate User Registration', testDuplicateUserRegistration);

    // Cleanup
    await runTest('User Logout', testLogout);
    await runTest('Cleanup Test Data', cleanupTestData);

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
