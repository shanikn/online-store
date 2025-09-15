# Project Q&A Documentation - ShaniknJewls Online Store

## 1. Why are there 2 different node_modules directories?
Root node_modules is for my express.js backend- it has dependencies for it (cookie-parser, express, cors, node-fetch)

If you don't use React in your project- you can delete `/client` directory.
(Deleted)

## 2. Is the cookie name 'userToken' standard? Should I personalize it?
I can change it but it's ok like this.

## 3. What's the user-accessible UI customization in my project?
// TODO: add user customizable feature
I need to add UI customization option- like a dark mode toggle, image resizing...

## 4. What node_modules are actually used in your project?

**Your project uses these npm packages:**

| Package | Where Used | Purpose |
|---------|------------|---------|
| **express** | server.js | Web server framework, handles HTTP requests/responses |
| **cookie-parser** | server.js | Parses cookies from requests for authentication |
| **cors** | server.js (commented) | Would enable cross-origin requests (for React) |
| **node-fetch** | test.js | Enables HTTP requests in your test suite |

These are installed in your root `/node_modules` directory and listed in `/package.json`.

## 5. What are the files in client/public/?

The `/client/public/` contains React boilerplate files:
- `index.html` - React's root HTML file
- `manifest.json` - Web app manifest for React
- `robots.txt` - Search engine instructions
- `favicon.ico` - React's default icon

**These are NOT used in your current version of the project.**

## 6. What is DOS and what attacks do you protect against?

**DOS = Denial of Service** - Attacks that try to make your website unavailable by overwhelming it.

**Common DOS attacks your project protects against:**

1. **Request Flooding** - Sending thousands of requests per second
   - **Your Protection:** Rate limiting (max 100 requests per minute per IP)

2. **Resource Exhaustion** - Trying to consume all server memory/CPU
   - **Your Protection:** Request limits prevent processing too many operations

3. **Brute Force Login** - Trying thousands of password combinations
   - **Your Protection:** Rate limiting slows down repeated login attempts

**Your Implementation (server.js lines 52-76):**
```javascript
const RATE_LIMIT = 100;  // Max 100 requests
const TIME_WINDOW = 60000;  // Per 60 seconds
// Tracks requests per IP and blocks after limit
```

This prevents attackers from overwhelming your server with automated requests.

## 7. How do I save my admin user in the filesystem so it exists from the start?

**Your admin user is automatically created!** It's built into your code in `persist_module.js` lines 57-65:

```javascript
// In loadUsers() function
if(!users.find(u=> u.username==='admin')){
    users.push({
        username: 'admin',
        password: 'admin',
        role: 'admin',
        createdAt: new Date().toISOString()
    });
    await saveUsers(users);
}
```

**This means:** Even if you submit a completely clean project with no `/data` folder, your teacher can still login with username: `admin`, password: `admin`. The admin account will be automatically created the first time the server runs and someone tries to login.

## 8. What error types can occur on form submission?

**Client-side validation errors (before server):**
- Missing required fields (username, password, email)
- Passwords don't match (register page)
- Invalid email format (missing @ or domain)

**Server-side errors (from server response):**
- Username already exists (registration)
- Invalid credentials (login)
- Server error (500 - database issues)
- Rate limiting (429 - too many requests)
- Session expired (401 - unauthorized)

**Network errors:**
- Connection timeout
- Server unreachable
- CORS errors (if misconfigured)

## 9. What does package.json consist of and why?

**Your package.json contains:**

```json
{
  "name": "online-store",           // Project name
  "version": "1.0.0",               // Version number
  "description": "RUNI 2025...",    // Project description
  "main": "server.js",              // Entry point file
  "scripts": {                      // Command shortcuts
    "start": "node server.js",      // npm start runs server
    "test": "node test.js"          // npm test runs tests
  },
  "dependencies": {                 // Required packages
    "cookie-parser": "^1.4.6",     // For parsing cookies
    "cors": "^2.8.5",               // For cross-origin requests
    "express": "^4.21.1",           // Web framework
    "node-fetch": "^2.7.0"          // For HTTP requests in tests
  }
}
```

**Why each part matters:**
- **name/version**: Identifies your project
- **main**: Tells Node.js which file to run
- **scripts**: Shortcuts for common commands
- **dependencies**: Lists packages to install with `npm install`

## 10. What other node_modules could improve my project?

**Security & Validation:**
- `helmet` - Adds security headers to protect against attacks
- `express-validator` - Better input validation
- `bcrypt` - Password hashing (instead of plain text)
- `express-rate-limit` - Better rate limiting

**Development:**
- `nodemon` - Auto-restarts server when you edit files
- `dotenv` - Manages environment variables
- `morgan` - HTTP request logging

**Database (if upgrading from JSON):**
- `mongoose` - MongoDB integration
- `sequelize` - SQL database ORM

**Example to add bcrypt for password security:**
```bash
npm install bcrypt
```
Then hash passwords before storing and compare hashes on login.

---

## Summary Recommendations

### Immediate Actions:
1. **DELETE** the entire `/client` folder - it's not part of your project
2. **KEEP** only the root-level directories: `/public`, `/data`, `/screens`, `/node_modules`
3. **OPTIONAL:** Add a simple dark mode toggle to fully meet UI customization requirement
4. **OPTIONAL:** Rename cookie to something unique like `snj_auth` if desired

### Your Final Project Structure Should Be:
```
/online_store
  /data         - JSON data files
  /public       - All your HTML pages
  /screens      - Server modules (empty but required)
  /node_modules - Server dependencies
  server.js     - Main server file
  persist_module.js - Data handling
  test.js       - Test suite
  package.json  - Project configuration
  CLAUDE.md     - Project documentation
```

This clarifies your project structure and removes all unnecessary React files!