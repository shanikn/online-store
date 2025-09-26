# CLAUDE.md

This file provides guidance to Claude Code when working with the Golden Jewelry Store codebase.

## Project Overview

This is a full-stack e-commerce jewelry store built with Node.js/Express and vanilla HTML/CSS/JavaScript. It's a Multi-Page Application (MPA) with server-side rendering and JSON-based data persistence.

### Key Characteristics
- **Architecture**: Traditional MPA with server-rendered HTML pages
- **Backend**: Node.js + Express.js server
- **Frontend**: Static HTML pages with inline JavaScript
- **Data Storage**: JSON files in the `data/` directory
- **Authentication**: Cookie-based sessions
- **No Build Process**: Direct execution without bundling

## Project Structure

```
online_store/
├── server.js              # Main Express server
├── persist_module.js      # Data persistence layer
├── test.js               # Test suite
├── screens/              # Server-side route handlers
│   ├── admin-server.js   # Admin panel endpoints
│   ├── cart-server.js    # Shopping cart endpoints
│   ├── checkout-server.js # Checkout process
│   ├── login-server.js   # Authentication endpoints
│   ├── register-server.js # User registration
│   ├── store-server.js   # Product listing endpoints
│   └── wishlist-server.js # Wishlist functionality
├── public/               # Static files served to browser
│   ├── *.html           # HTML pages (store, cart, checkout, etc.)
│   ├── styles/          # CSS files
│   │   └── theme.css    # Main stylesheet
│   └── scripts/         # Client-side JavaScript
│       ├── layout.js    # Common layout functions
│       └── theme.js     # Theme management
├── data/                # JSON data storage
│   ├── products.json    # Product catalog
│   ├── users.json       # User accounts
│   ├── wishlists.json   # User wishlists
│   ├── contacts.json    # Contact messages
│   └── user_data/       # Per-user data files
│       ├── {username}_cart.json     # User's cart
│       ├── {username}_activity.json # User activity log
│       └── {username}_purchases.json # Purchase history
└── tests/               # Test files (if any)
```

## Development Commands

### Running the Application
```bash
npm start          # Start the server (port 5000)
npm run dev        # Same as npm start
node server.js     # Direct execution
```

### Testing
```bash
npm test           # Run test suite (executes test.js)
npm run test:unit  # Run Jest unit tests
npm run test:integration # Run integration tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Code Quality
```bash
npm run lint       # Check code style with ESLint
npm run lint:fix   # Auto-fix linting issues
```

## API Endpoints

### Authentication
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /register` - New user registration
- `GET /api/current-user` - Get current user info

### Store Operations
- `GET /api/products` - Get all products
- `GET /api/product/:id` - Get specific product
- `POST /api/filter-products` - Filter products by category

### Cart Management
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `POST /api/cart/remove` - Remove item from cart
- `POST /api/cart/update` - Update item quantity
- `POST /api/cart/clear` - Clear entire cart

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/add` - Add to wishlist
- `POST /api/wishlist/remove` - Remove from wishlist
- `POST /api/wishlist/toggle` - Toggle wishlist item

### Checkout
- `POST /api/checkout` - Process order
- `GET /api/purchases` - Get purchase history

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/activity/:username` - Get user activity
- `POST /api/admin/product` - Add/update product
- `DELETE /api/admin/product/:id` - Delete product

## Data Models

### User
```json
{
  "username": "string",
  "password": "string (hashed)",
  "email": "string",
  "isAdmin": "boolean"
}
```

### Product
```json
{
  "id": "string",
  "name": "string",
  "price": "number",
  "description": "string",
  "category": "string",
  "image": "string (URL)",
  "stock": "number"
}
```

### Cart Item
```json
{
  "productId": "string",
  "quantity": "number",
  "addedAt": "timestamp"
}
```

## Coding Guidelines

### File Naming
- Server-side handlers: `{feature}-server.js`
- HTML pages: `{pagename}.html` (lowercase)
- Data files: `{datatype}.json`

### JavaScript Style
- **Module System**: CommonJS (`require`/`module.exports`)
- **Async Operations**: Callbacks or Promises (no async/await in older code)
- **Error Handling**: Try-catch blocks with proper error responses
- **Authentication**: Cookie-based with `userToken`

### HTML Structure
- Each page includes common navigation header
- Inline `<script>` tags for page-specific JavaScript
- Font Awesome icons for UI elements
- Bootstrap-inspired custom CSS classes

### Data Persistence
- All data stored in JSON files
- User-specific data in `data/user_data/`
- Use `persist_module.js` for all file operations
- Implement proper file locking for concurrent access

## Security Considerations

### Authentication
- Store hashed passwords (never plain text)
- Use secure cookies with httpOnly flag
- Implement session timeout
- Validate user permissions for admin routes

### Input Validation
- Sanitize all user inputs
- Validate data types and ranges
- Prevent SQL injection (even though using JSON)
- Implement rate limiting for API endpoints

### Data Protection
- Don't expose sensitive user data in responses
- Implement proper access controls
- Log security-relevant events
- Regular backup of JSON data files

## Testing Strategy

### Unit Tests
- Test persist_module functions
- Test authentication logic
- Test data validation functions
- Test cart calculations

### Integration Tests
- Test complete user flows
- Test API endpoint responses
- Test error handling
- Test concurrent operations

## Performance Optimization

### Current Architecture
- Static file serving with Express
- In-memory caching for frequently accessed data
- Minimize JSON file reads/writes
- Compress large responses

### Future Improvements
- Consider database migration for scalability
- Implement Redis for session management
- Add CDN for static assets
- Enable gzip compression

## Deployment Considerations

### Environment Variables
```bash
PORT=5000               # Server port
NODE_ENV=production     # Environment
SESSION_SECRET=xxx      # Session encryption key
```

### Production Checklist
- [ ] Set NODE_ENV to production
- [ ] Configure proper error handling
- [ ] Set up logging system
- [ ] Enable HTTPS
- [ ] Configure backup strategy
- [ ] Set up monitoring

## Common Issues and Solutions

### Issue: Cart not persisting
- Check cookie settings
- Verify user is logged in
- Check file permissions in data/user_data/

### Issue: Products not loading
- Verify products.json exists and is valid
- Check persist_module is working
- Look for console errors

### Issue: Login not working
- Check users.json file format
- Verify password hashing
- Check cookie domain settings

## Development Workflow

### Adding a New Feature
1. Create route handler in `screens/`
2. Add endpoint in `server.js`
3. Create/update HTML page in `public/`
4. Add necessary data files in `data/`
5. Write tests in `test.js`
6. Update this documentation

### Making Changes
1. Run `npm test` before starting
2. Make changes incrementally
3. Test each change manually
4. Run `npm run lint` to check code style
5. Run full test suite before committing
6. Update relevant documentation

## Important Notes

- This is NOT a bundled SPA application
- No webpack, vite, or other bundlers are used
- Client-side code is inline or in simple script files
- Data persistence is file-based, not database-based
- The project is designed for educational purposes