# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a RUNI 2025 FullStack course final project - an online store web application built with Node.js/Express.

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
- **Navigation system** with consistent hamburger menu across all pages
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

### Known Issues
- None - Project is fully functional and ready for submission

### Current Status: PROJECT COMPLETE ✅
All PDF requirements have been successfully implemented and tested. The application is fully functional with:
- Authentication and authorization working
- Shopping cart and checkout process complete
- Admin panel with activity tracking functional
- Comprehensive test suite passing
- All documentation complete

## Route Structure

### Public Routes (No Auth Required)
- GET `/` - Redirects to login
- GET `/login.html` - Login page
- GET `/register.html` - Registration page
- GET `/readme.html` - Project documentation
- GET `/llm.html` - LLM code documentation
- POST `/login` - Authentication endpoint
- POST `/register` - User registration endpoint

### Protected Routes (Auth Required)
- GET `/store.html` - Product catalog
- GET `/cart.html` - Shopping cart
- GET `/checkout.html` - Payment page
- GET `/admin.html` - Admin panel
- GET `/api/products` - Get all products
- POST `/api/cart/add` - Add to cart
- DELETE `/api/cart/remove` - Remove from cart
- GET `/api/products/search` - Product search with query parameter
- POST `/api/checkout` - Process payment
- GET `/api/admin/activity` - Get activity logs (with optional username filter)
- POST `/api/admin/products` - Add product
- DELETE `/api/admin/products/:id` - Remove product
- GET `/api/user/purchases` - Get user's purchase history ("My Items")

## Security Considerations
- Never store passwords in plain text
- Validate all user inputs
- Implement rate limiting for DOS protection
- Sanitize data before storing in JSON files
- Use secure cookie settings
- Validate file paths to prevent directory traversal