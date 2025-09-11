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

### Completed
- Basic Express server setup
- Static file serving  
- Cookie parser middleware
- Login endpoint with placeholder authentication (admin/admin)
- Basic `requireAuth` middleware
- Partial route structure (login, logout, register, store, cart, admin)
- Helper function placeholders (`getCurrentUser`)

### Known Issues
- Cookie name typo in server.js line 72: "userToker" should be "userToken"
- Route method mismatch: `/api/cart/add` defined as GET instead of POST (line 145)

### TODO Priority Tasks
1. Fix cookie name typo ("userToker" → "userToken")
2. Implement `persist_module.js` with async file I/O functions
3. Complete screen server modules with proper routing
4. Replace placeholder authentication with user validation
5. Implement activity logging system
6. Add DOS attack protection (rate limiting)
7. Create product search functionality
8. Build shopping cart persistence
9. Implement admin panel with filters
10. Add UI customization with localStorage
11. Create comprehensive test suite with node-fetch
12. Implement logout and register endpoints

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