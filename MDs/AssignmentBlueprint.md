> **Complete Node.js + Express + Vanilla JS Jewelry Store**
> 

> Assignment specifications and implementation guide for the final project.
> 

---

## 🏗️ Project Structure (Required Files)

```
<id><first><last><partner><partnerId>_FP25/
├── package.json
├── server.js                      # App entry, mounts modules, security, error handler
├── /screens                       # Server modules (as required)
│  ├── persist_module.js           # FS load/save, atomic writes, caching
│  ├── login-server.js             # register/login/logout, remember-me cookies
│  ├── products-server.js          # products list + prefix search
│  ├── cart-server.js              # add/remove/list cart
│  ├── checkout-server.js          # create checkout intent from cart
│  ├── pay-server.js               # fake payment + order creation
│  ├── my-items-server.js          # purchased items for current user
│  ├── admin-server.js             # activity log + product management
│  ├── wishlist-server.js          # (extra page) wishlist CRUD
│  ├── profile-server.js           # (extra page) update profile fields
│  └── register-server.js          # user registration
├── /data                          # persisted data on disk (loaded at startup)
│  ├── products.json
│  ├── users.json                  # user accounts with sessions
│  └── user_data/
│     ├── <userId>_cart.json       # individual user cart files
│     ├── <userId>_wishlist.json   # individual user wishlist files
│     ├── <userId>_purchases.json  # individual user purchase history
│     └── <userId>_activity.json   # individual user activity logs
├── /public                        # static client
│  ├── styles/
│  │  └── theme.css                # unified styling with dark/light mode
│  ├── scripts/
│  │  └── layout.js                # core UI functionality
│  ├── store.html                  # main product catalog
│  ├── login.html
│  ├── register.html
│  ├── cart.html
│  ├── checkout.html
│  ├── pay.html
│  ├── my-items.html
│  ├── admin.html
│  ├── wishlist.html               # (extra 1) saved favorites
│  ├── profile.html                # (extra 2) user account management
│  ├── about.html                  # (extra 3) brand story & craftsmanship
│  ├── contact.html                # (extra 4) customer support & inquiries
│  ├── collection-bracelets.html   # (extra 5) bracelet collection showcase
│  ├── collection-hoops.html       # (extra 6) hoop earrings collection
│  ├── collection-wedding.html     # (extra 7) wedding jewelry collection
│  ├── readme.html                 # project documentation (required)
│  └── llm.html                    # LLM-generated code documentation (required)
├── test.js                        # node-fetch tests for all dynamic routes
└── scripts/
   └── seed.js                     # create admin user, sample products
```

---

## 🔑 Core Requirements

### Authentication System

- **Register Screen**: User registration with validation
- **Login Screen**: Authentication with "remember me" checkbox
    - Remember me: cookie expires after **12 days**
    - Normal login: cookie expires after **30 minutes**
- **Pre-existing User**: `admin`/`admin` (username/password)
- **Logout**: Available in menu on all authenticated pages

### Store Functionality

- **Product Display**: Show all jewelry items
- **Search**: Textual prefix search by name or description
- **Add to Cart**: Requires authentication (redirect to login if not logged in)

### Shopping Flow

1. **Cart Screen**: View added products, remove items
2. **Checkout Screen**: Review cart contents and proceed
3. **Pay Screen**: Fake payment form with success confirmation
4. **Thank You Page**: Payment success confirmation
5. **My Items Screen**: View all purchased items

### Admin Features

- **Activity Log**: Table showing datetime, username, activity type (login/logout/add-to-cart)
- **Username Filter**: Filter activity by username prefix
- **Product Management**: Add/remove products (title, description, picture URL/file)

---

## 🎯 Implementation Requirements

### Server Architecture

- **Modular Design**: Each screen's server logic in separate modules
    - `store.html` ↔ `products-server.js`
    - `cart.html` ↔ `cart-server.js`
    - etc.
- **Data Persistence**: Separate `persist_module.js` for all file operations
- **Async/Await**: Required for all asynchronous operations
- **HTTP Methods**: Use appropriate methods (GET/POST/PUT/DELETE)
- **Error Handling**: Handle all errors, exceptions, and async errors

### Data Persistence

- **File System**: All data stored in files, survives server restart
- **User Data**: Individual files per user for cart, purchases, activity
- **Session Management**: Cookie-based with proper expiration

### Security & DoS Protection

- **Rate Limiting**: Defend against DoS attacks
- **Input Validation**: Validate all user inputs
- **Error Handling**: Never expose stack traces to clients
- **Activity Logging**: Track user actions for admin monitoring

---

## 🌟 Extra Pages (Minimum 4 Required)

**✅ Implemented (7 additional pages):**

1. **Wishlist** (`/wishlist.html`)
    - Save favorite items for later
    - Add/remove items from wishlist
    - Server communication: `GET/POST/DELETE /api/wishlist`
2. **Profile** (`/profile.html`)
    - User account management
    - Update personal information
    - Server communication: `GET/PUT /api/profile`
3. **About** (`/about.html`)
    - Brand story and craftsmanship details
    - Company information and values
    - Server communication: Dynamic content loading
4. **Contact** (`/contact.html`)
    - Customer support and inquiries
    - Contact form submission
    - Server communication: `POST /api/contact`
5. **Bracelet Collection** (`/collection-bracelets.html`)
    - Specialized bracelet showcase
    - Filtered product display
    - Server communication: `GET /api/products?category=bracelets`
6. **Hoop Earrings Collection** (`/collection-hoops.html`)
    - Hoop earrings specialty page
    - Category-specific filtering
    - Server communication: `GET /api/products?category=hoops`
7. **Wedding Collection** (`/collection-wedding.html`)
    - Wedding jewelry showcase
    - Bridal-focused product display
    - Server communication: `GET /api/products?category=wedding`

**All extra pages communicate with server and provide unique, non-duplicate functionality.**

---

## 🔗 API Routes Implementation

### Authentication

```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login with remember me
POST /api/auth/logout      # User logout
```

### Products & Store

```
GET  /api/products         # Get all products
GET  /api/products?q=<prefix>  # Search products by prefix
GET  /api/products?category=<cat>  # Filter by category
```

### Shopping Cart

```
GET    /api/cart           # Get user's cart
POST   /api/cart           # Add item to cart
DELETE /api/cart/:productId # Remove item from cart
```

### Checkout & Payment

```
POST /api/checkout         # Create checkout session
POST /api/pay             # Process fake payment
GET  /api/my-items        # Get user's purchases
```

### Admin Features

```
GET    /api/admin/activity?usernamePrefix=  # Get activity logs
POST   /api/admin/products                  # Add new product
DELETE /api/admin/products/:id              # Remove product
```

### Extra Features

```
GET    /api/wishlist       # Get user's wishlist
POST   /api/wishlist       # Add to wishlist
DELETE /api/wishlist/:id   # Remove from wishlist
GET    /api/profile        # Get user profile
PUT    /api/profile        # Update user profile
POST   /api/contact        # Submit contact form
```

---

## 🎨 Client-Side Requirements

### UI Customization

- **Theme System**: Dark/light mode toggle
- **localStorage**: Persist theme preference
- **Responsive Design**: Mobile-friendly interface

### JavaScript Requirements

- **Async/Await**: All asynchronous operations
- **Fetch API**: Communication with server
- **Error Handling**: Graceful error management
- **Authentication State**: Proper login/logout handling

---

## 🧪 Testing Requirements

### test.js Implementation

- **Node-fetch**: Test all server-side routes
- **Automated Testing**: Intelligent route testing
- **Output**: Print test names and pass/fail status
- **Coverage**: Test all dynamic server functionality

### Test Scenarios

1. Server health checks
2. Authentication flow (register/login/logout)
3. Product catalog and search
4. Shopping cart operations
5. Checkout and payment flow
6. Admin functionality
7. Extra page features

---

## 📦 Package.json Requirements

### Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "test": "node test.js",
    "seed": "node scripts/seed.js"
  }
}
```

### Dependencies

- **express**: Web framework
- **cookie-parser**: Cookie handling
- **bcryptjs**: Password hashing
- **uuid**: Unique ID generation
- **helmet**: Security headers
- **express-rate-limit**: DoS protection
- **node-fetch**: Testing (devDependency)

---

## 📋 Required Documentation

### readme.html

- Store name and products sold
- Additional pages and functionality
- Development challenges
- Partner collaboration details
- Complete route listing
- Testing methodology

### llm.html

- All LLM-generated code
- AI assistance documentation
- Code attribution

---

## ✅ Grading Criteria

1. **Functionality/Instructions** - All requirements implemented
2. **Effort** - Comprehensive feature set
3. **Code Quality** - Async-first, modular, efficient
4. **User Experience** - Intuitive and responsive
5. **Richness/Depth** - Advanced features and polish
6. **Security** - Proper authentication and validation

**Submission Deadline**: September 2nd, 23:59 (1 point penalty per day after)

---

## 🎯 Success Checklist

- ✅ **Authentication**: Register, login, logout with proper cookies
- ✅ **Store**: Product display with search functionality
- ✅ **Shopping**: Cart, checkout, payment, purchase history
- ✅ **Admin**: Activity logs and product management
- ✅ **Extra Pages**: 7 additional functional pages
- ✅ **Persistence**: File-based data storage
- ✅ **Security**: DoS protection and input validation
- ✅ **Testing**: Comprehensive test suite
- ✅ **Documentation**: Complete readme and LLM documentation
- ✅ **Code Quality**: Modular, async-first architecture

---

## 🚀 Implementation Status

**Current Project**: ShaniknJewls Handcrafted Jewelry Store

**Technology Stack**: Node.js + Express + Vanilla JavaScript

**Architecture**: Modular server design with JSON file persistence

**Features**: Complete e-commerce platform with 17 pages and 10 server modules

**Status**: Feature-complete, ready for final testing and submission