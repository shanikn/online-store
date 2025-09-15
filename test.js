const fetch = require('node-fetch');

const SERVER_URL = 'http://localhost:5000';

// Test results
let passedTests = 0;
let totalTests = 0;

// Test runner
function runTest(testName, testFunction) {
    totalTests++;
    console.log(`\nRunning test: ${testName}`);

    return testFunction()
        .then(() => {
            passedTests++;
            console.log(` PASS: ${testName}`);
        })
        .catch(error => {
            console.log(`L FAIL: ${testName}`);
            console.log(`   Error: ${error.message}`);
        });
}

// Test utilities
async function makeRequest(endpoint, options = {}) {
    const url = `${SERVER_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    return response;
}

async function loginAsAdmin() {
    const response = await makeRequest('/login', {
        method: 'POST',
        body: JSON.stringify({
            username: 'admin',
            password: 'admin',
            remember: false
        })
    });

    const cookies = response.headers.get('set-cookie');
    return cookies ? cookies.split(';')[0] : null;
}

// Individual Tests
async function testServerRunning() {
    const response = await makeRequest('/');
    if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
    }
}

async function testLoginEndpoint() {
    const response = await makeRequest('/login', {
        method: 'POST',
        body: JSON.stringify({
            username: 'admin',
            password: 'admin',
            remember: false
        })
    });

    const data = await response.json();
    if (!data.success) {
        throw new Error('Login failed with correct credentials');
    }
}

async function testLoginWithWrongCredentials() {
    const response = await makeRequest('/login', {
        method: 'POST',
        body: JSON.stringify({
            username: 'wronguser',
            password: 'wrongpass',
            remember: false
        })
    });

    const data = await response.json();
    if (data.success) {
        throw new Error('Login succeeded with wrong credentials');
    }
}

async function testRegisterEndpoint() {
    const testUser = {
        username: `testuser_${Date.now()}`,
        password: 'testpass123',
        email: 'test@example.com',
        confirmPassword: 'testpass123'
    };

    const response = await makeRequest('/register', {
        method: 'POST',
        body: JSON.stringify(testUser)
    });

    if (response.status !== 200) {
        throw new Error(`Register failed with status ${response.status}`);
    }
}

async function testGetProducts() {
    const cookie = await loginAsAdmin();
    const response = await makeRequest('/api/products', {
        headers: { Cookie: cookie }
    });

    if (response.status !== 200) {
        throw new Error(`Get products failed with status ${response.status}`);
    }

    const products = await response.json();
    if (!Array.isArray(products)) {
        throw new Error('Products response is not an array');
    }
}

async function testProductSearch() {
    const cookie = await loginAsAdmin();
    const response = await makeRequest('/api/products/search?q=ring', {
        headers: { Cookie: cookie }
    });

    if (response.status !== 200) {
        throw new Error(`Product search failed with status ${response.status}`);
    }

    const results = await response.json();
    if (!Array.isArray(results)) {
        throw new Error('Search results is not an array');
    }
}

async function testAddToCart() {
    const cookie = await loginAsAdmin();

    // First get products to find a valid product ID
    const productsResponse = await makeRequest('/api/products', {
        headers: { Cookie: cookie }
    });
    const products = await productsResponse.json();

    if (products.length === 0) {
        throw new Error('No products available to add to cart');
    }

    const response = await makeRequest('/api/cart/add', {
        method: 'POST',
        headers: { Cookie: cookie },
        body: JSON.stringify({ productId: products[0].id })
    });

    if (response.status !== 200) {
        throw new Error(`Add to cart failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
        throw new Error('Add to cart returned success: false');
    }
}

async function testGetCart() {
    const cookie = await loginAsAdmin();
    const response = await makeRequest('/api/cart', {
        headers: { Cookie: cookie }
    });

    if (response.status !== 200) {
        throw new Error(`Get cart failed with status ${response.status}`);
    }

    const cart = await response.json();
    if (!Array.isArray(cart)) {
        throw new Error('Cart response is not an array');
    }
}

async function testUpdateCartQuantity() {
    const cookie = await loginAsAdmin();

    // First get products and add one to cart
    const productsResponse = await makeRequest('/api/products', {
        headers: { Cookie: cookie }
    });
    const products = await productsResponse.json();

    if (products.length === 0) {
        throw new Error('No products available');
    }

    // Add to cart
    await makeRequest('/api/cart/add', {
        method: 'POST',
        headers: { Cookie: cookie },
        body: JSON.stringify({ productId: products[0].id })
    });

    // Update quantity
    const response = await makeRequest('/api/cart/update', {
        method: 'PUT',
        headers: { Cookie: cookie },
        body: JSON.stringify({
            productId: products[0].id,
            quantity: 3
        })
    });

    if (response.status !== 200) {
        throw new Error(`Update cart failed with status ${response.status}`);
    }
}

async function testRemoveFromCart() {
    const cookie = await loginAsAdmin();

    // First get products and add one to cart
    const productsResponse = await makeRequest('/api/products', {
        headers: { Cookie: cookie }
    });
    const products = await productsResponse.json();

    if (products.length === 0) {
        throw new Error('No products available');
    }

    // Add to cart
    await makeRequest('/api/cart/add', {
        method: 'POST',
        headers: { Cookie: cookie },
        body: JSON.stringify({ productId: products[0].id })
    });

    // Remove from cart
    const response = await makeRequest(`/api/cart/remove/${products[0].id}`, {
        method: 'DELETE',
        headers: { Cookie: cookie }
    });

    if (response.status !== 200) {
        throw new Error(`Remove from cart failed with status ${response.status}`);
    }
}

async function testCheckoutEndpoint() {
    const cookie = await loginAsAdmin();

    const checkoutData = {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '123-456-7890',
        address: '123 Test St',
        city: 'Test City',
        zipCode: '12345',
        country: 'Israel',
        cardName: 'Test User',
        cardNumber: '1234567812345678',
        expiry: '12/25',
        cvv: '123',
        items: [],
        total: 0
    };

    const response = await makeRequest('/api/checkout', {
        method: 'POST',
        headers: { Cookie: cookie },
        body: JSON.stringify(checkoutData)
    });

    if (response.status !== 200) {
        throw new Error(`Checkout failed with status ${response.status}`);
    }
}

async function testGetActivities() {
    const cookie = await loginAsAdmin();
    const response = await makeRequest('/api/admin/activities', {
        headers: { Cookie: cookie }
    });

    if (response.status !== 200) {
        throw new Error(`Get activities failed with status ${response.status}`);
    }

    const activities = await response.json();
    if (!Array.isArray(activities)) {
        throw new Error('Activities response is not an array');
    }
}

async function testAddProduct() {
    const cookie = await loginAsAdmin();

    const productData = {
        name: `Test Product ${Date.now()}`,
        description: 'A test product',
        price: 99.99,
        image: 'https://example.com/test.jpg',
        customizable: false
    };

    const response = await makeRequest('/api/admin/products', {
        method: 'POST',
        headers: { Cookie: cookie },
        body: JSON.stringify(productData)
    });

    if (response.status !== 200) {
        throw new Error(`Add product failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
        throw new Error('Add product returned success: false');
    }
}

async function testLogout() {
    const cookie = await loginAsAdmin();
    const response = await makeRequest('/logout', {
        method: 'POST',
        headers: { Cookie: cookie }
    });

    if (response.status !== 200) {
        throw new Error(`Logout failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
        throw new Error('Logout returned success: false');
    }
}

async function testProtectedRouteWithoutAuth() {
    const response = await makeRequest('/api/products');

    if (response.status !== 302 && response.status !== 401) {
        throw new Error(`Expected redirect or unauthorized, got ${response.status}`);
    }
}

async function testRateLimiting() {
    // Make many requests quickly to trigger rate limit
    const requests = [];
    for (let i = 0; i < 105; i++) {
        requests.push(makeRequest('/'));
    }

    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(r => r.status === 429);

    if (rateLimitedResponses.length === 0) {
        throw new Error('Rate limiting not working - no 429 responses received');
    }
}

// Main test runner
async function runAllTests() {
    console.log('=€ Starting automated tests for online store...\n');
    console.log('Testing server at:', SERVER_URL);

    // Wait a bit for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Run all tests
    await runTest('Server Running', testServerRunning);
    await runTest('Login Endpoint', testLoginEndpoint);
    await runTest('Login with Wrong Credentials', testLoginWithWrongCredentials);
    await runTest('Register Endpoint', testRegisterEndpoint);
    await runTest('Protected Route Without Auth', testProtectedRouteWithoutAuth);
    await runTest('Get Products', testGetProducts);
    await runTest('Product Search', testProductSearch);
    await runTest('Add to Cart', testAddToCart);
    await runTest('Get Cart', testGetCart);
    await runTest('Update Cart Quantity', testUpdateCartQuantity);
    await runTest('Remove from Cart', testRemoveFromCart);
    await runTest('Checkout Endpoint', testCheckoutEndpoint);
    await runTest('Get Activities (Admin)', testGetActivities);
    await runTest('Add Product (Admin)', testAddProduct);
    await runTest('Logout', testLogout);
    await runTest('Rate Limiting', testRateLimiting);

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('=Ê TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (passedTests === totalTests) {
        console.log('\n<‰ All tests passed! Your online store is working correctly.');
    } else {
        console.log('\n   Some tests failed. Check the output above for details.');
    }

    process.exit(passedTests === totalTests ? 0 : 1);
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(error => {
        console.error('Test runner crashed:', error);
        process.exit(1);
    });
}

module.exports = { runAllTests };