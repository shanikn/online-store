# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a RUNI 2025 FullStack course final project - an online gold jewelry store web application built with Node.js/Express.

### Project Requirements Summary
- **Authentication**: Cookie-based with "remember me" functionality
- **User Roles**: Regular users and admin (admin/admin credentials)
- **Data Persistence**: JSON files in `/data` directory
- **Modular Architecture**: Server-side screen handlers in separate modules
- **Security**: DOS attack protection required
- **Testing**: Automated test suite using node-fetch
- **UI Customization**: LocalStorage-based theme/view customization

## Architecture

### Server Structure
- **Main Server**: `server.js` - Express application entry point
  - Port: 5000
  - Middleware: cookie-parser, express.json, express.urlencoded, static files
  - Authentication: `requireAuth` middleware using `userToken` cookie
  
- **Screen Modules**: `/screens/*.js` - Each screen's server logic in separate module
  - `login-server.js` - Login/authentication logic
  - `register-server.js` - User registration
  - `store-server.js` - Product catalog and search
  - `cart-server.js` - Shopping cart management
  - `checkout-server.js` - Payment processing
  - `admin-server.js` - Admin panel and activity tracking

- **Data Module**: `persist_module.js` - ALL file I/O operations must go through this module
  - Handles reading/writing to JSON files
  - Must use async/await for all operations

### Data Files (`/data/`)
- `users.json` - User accounts, credentials, and profiles
- `products.json` - Product catalog (title, description, image)
- `carts.json` - Shopping cart data per user
- `activity.json` - User activity logs (login/logout/add-to-cart)

### Frontend Pages (`/public/`)
- `login.html` - Entry point with "remember me" checkbox
- `register.html` - New user registration
- `store.html` - Product catalog with search functionality
- `cart.html` - Shopping cart management
- `checkout.html` - Payment form (fake payment)
- `admin.html` - Admin dashboard with activity logs and product management
- `profile.html`, `wishlist.html`, `about.html`, `contact.html` - Additional pages
- `readme.html` - Project documentation (individual work)
- `llm.html` - LLM-generated code documentation

### Frontend Scripting Notes
- Pages that load `public/scripts/layout.js` must not redeclare `let isAuthenticated`. Doing so throws a syntax error that prevents `initializeBaseLayout()` from executing, which causes empty side menus and permanent loading spinners.
- Pages must not redefine functions that exist in `layout.js` (such as `checkAuthStatus`, `updateNavigation`, `toggleMenu`, `toggleTheme`). Duplicate function definitions will cause conflicts and prevent proper functionality.
- All pages should use `onclick` handlers in HTML elements to call functions from `layout.js`. The layout.js handles moving buttons to floating positions and setting up proper event listeners.
- The `initializeBaseLayout()` function must be called in the DOMContentLoaded event listener on every page that uses shared layout functionality.

## Development Commands

```bash
# Install dependencies
npm install

# Start server
node server.js

# Run automated tests
node test.js
```

Server URL: http://127.0.0.1:5000/

## Key Implementation Requirements

### Authentication
- Cookie name: `userToken`
- Session duration: 30 minutes (default) or 12 days (remember me)
- Default admin user: username="admin", password="admin"
- All pages except login, register, readme, and products require authentication

### Required Features
1. **Product Search**: Textual prefix search by name or description
2. **Shopping Cart**: Add/remove products, persists across sessions
3. **Activity Logging**: Track login/logout/add-to-cart events with timestamps
4. **Admin Panel**: 
   - Activity table with columns: datetime, username, activity type
   - Username prefix filter for activity logs
   - Product management (add/remove products with title, description, image)
5. **DOS Protection**: Implement rate limiting or similar protection
6. **UI Customization**: User-configurable theme stored in localStorage

### Module Structure Rules
- Each screen's server logic MUST be in separate module (`screens/*-server.js`)
- ALL data persistence MUST go through `persist_module.js`
- Use async/await for all asynchronous operations
- Choose appropriate HTTP methods (GET/POST/PUT/DELETE)
- Handle all errors, exceptions, and async errors

### Testing Requirements
- `test.js` must test all dynamic server routes
- Use node-fetch for testing
- Print test names and pass/fail status to stdout
- Test only server-side routes, not static files

### Additional Pages Required
- Minimum 4 additional functional pages
- Each must communicate with server
- Must be distinct in functionality

## Current Implementation Status

### ✅ COMPLETED (100% Functional)
- **Full Express server** with all routes and middleware
- **Complete authentication system** with cookie-based sessions and "remember me"
- **Data persistence layer** (`persist_module.js`) with async JSON file operations
- **All HTML pages** - Login, Register, Store, Cart, Checkout, Admin, About, Contact, Wishlist, Profile, Readme
- **Product catalog** with search functionality and dynamic display
- **Shopping cart system** with add/remove/update quantities and persistence
- **Checkout process** with complete payment form and order processing
- **Admin dashboard** with activity logs, product management, and user filtering
- **Activity logging** for login/logout/add-to-cart events with timestamps
- **DOS protection** with rate limiting middleware
- **Navigation system** with dynamic authentication-aware menus across all pages
- **Comprehensive testing** with 18 automated tests using node-fetch
- **Project documentation** with individual work report and setup instructions

### ✅ Core Features Working
- **Authentication**: Cookie-based with "remember me" functionality ✓
- **User Roles**: Regular users and admin (admin/admin) ✓
- **Data Persistence**: JSON files with async operations ✓
- **Security**: Rate limiting and input validation ✓
- **Testing**: Complete test suite with node-fetch ✓
- **UI**: Consistent styling and navigation ✓

### ✅ All Required Pages Implemented
- **12 functional HTML pages** with server communication
- **4+ additional pages** (About, Contact, Wishlist, Profile) as required
- **Documentation pages** (readme.html with individual work report)
- **All pages have consistent navigation** with hamburger menu

### ✅ LATEST FEATURES ADDED (September 2025)
- **Product Customization System** with modal interface for jewelry personalization
- **Ring Sizing Options** (sizes 5-11) for customizable rings
- **Engraving Services** (max 20 characters) for bracelets and watches
- **Dynamic Product Buttons** showing "Customize & Add" for customizable items
- **Enhanced Cart System** supporting unique customized items with separate tracking
- **Live Search Dropdown** with 4-result preview and keyboard navigation
- **Column Layout Selector** (2, 3, 5 columns) with localStorage persistence
- **Improved Product Image Positioning** for better jewelry display
- **Enhanced Visual Separation** with product card borders and hover effects

### Known Issues
- None - Project is fully functional and ready for submission

### Current Status: PROJECT COMPLETE ✅
All PDF requirements have been successfully implemented and tested. The application is fully functional with:
- Authentication and authorization working
- Shopping cart and checkout process complete
- Admin panel with activity tracking functional
- Comprehensive test suite passing
- All documentation complete
- **NEW**: Complete customization system for jewelry personalization

## Authentication Flow

### User Experience
- **Home page**: Users land on `/store.html` and can browse products without login
- **Product browsing**: Search and view products works without authentication
- **Cart actions**: Clicking "Add to Cart" redirects to login if not authenticated
- **Navigation**: Menu dynamically shows different options based on login status:
  - **Not logged in**: Store, About, Contact, Login, Register
  - **Logged in**: Store, Cart, Wishlist, About, Contact, Profile, Admin, Logout
- **Auto-redirect**: After login, users return to their intended action

### Authentication Implementation
- Cookie-based authentication using `userToken` cookie
- Admin user automatically created on first server run
- Session duration: 30 minutes (default) or 12 days (remember me)

## Route Structure

### Public Routes (No Auth Required)
- GET `/` - Redirects to store (users can browse without login)
- GET `/store.html` - Product catalog (public browsing)
- GET `/products.html` - Same as store (alias)
- GET `/login.html` - Login page
- GET `/register.html` - Registration page
- GET `/readme.html` - Project documentation
- GET `/api/products` - Get all products (public API)
- GET `/api/products/search` - Product search (public API)
- POST `/login` - Authentication endpoint
- POST `/register` - User registration endpoint

### Protected Routes (Auth Required)
- GET `/cart.html` - Shopping cart
- GET `/checkout.html` - Payment page
- GET `/admin.html` - Admin panel
- GET `/profile.html` - User profile
- POST `/api/cart/add` - Add to cart (redirects to login if not authenticated)
- DELETE `/api/cart/remove` - Remove from cart
- PUT `/api/cart/update` - Update cart quantities
- DELETE `/api/cart/clear` - Clear entire cart
- GET `/api/cart` - Get user's cart contents
- POST `/api/checkout` - Process payment
- GET `/api/admin/activities` - Get activity logs (with optional username filter)
- POST `/api/admin/products` - Add product
- DELETE `/api/admin/products/:id` - Remove product
- GET `/api/purchases` - Get user's purchase history
- GET `/api/users/current` - Get current user info
- PUT `/api/profile` - Update user profile
- POST `/api/contact` - Submit contact form
- GET `/api/wishlist` - Get user wishlist
- POST `/api/wishlist/add` - Add to wishlist

## Security Considerations
- Never store passwords in plain text
- Validate all user inputs
- Implement rate limiting for DOS protection
- Sanitize data before storing in JSON files
- Use secure cookie settings
- Validate file paths to prevent directory traversal

## Project Submission

### Files to Include in Submission Zip
```
/online_store
  /public           - All HTML pages (required)
    - login.html
    - register.html
    - store.html
    - cart.html
    - checkout.html
    - admin.html
    - about.html
    - contact.html
    - wishlist.html
    - profile.html
    - readme.html
  server.js         - Main server file (required)
  persist_module.js - Data handling module (required)
  test.js          - Test suite (required)
  package.json     - Dependencies and scripts (required)
  CLAUDE.md        - Project documentation (required)
  PROJECT_QA.md    - Q&A documentation (optional)
```

### Files to EXCLUDE from Submission
- `/node_modules` - Teacher will run `npm install`
- `/client` - React leftovers not part of vanilla project
- `/data` - Admin user auto-creates, not needed
- IDE files (.vscode, .idea, etc.)
- Cache files

### Teacher Setup Instructions
1. Extract the submission zip file
2. Run `npm install` to install dependencies
3. Run `node server.js` to start the server
4. Visit `http://127.0.0.1:5000/`
5. Login with username: `admin`, password: `admin`

**Note:** Admin account is automatically created on first server run - no pre-existing data files needed.
