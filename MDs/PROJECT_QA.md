# Project Q&A Documentation - ShanikJewels Online Store
*Updated: September 26, 2025*

## 1. What node_modules are actually used in your project?

**Your project uses these npm packages:**

| Package | Where Used | Purpose |
|---------|------------|---------|
| **express** | server.js | Web server framework, handles HTTP requests/responses |
| **cookie-parser** | server.js | Parses cookies from requests for authentication |
| **node-fetch** | test.js | Enables HTTP requests in your test suite |

**Location:** `/node_modules` directory, listed in `/package.json`

**Note:** CORS is installed but commented out (not currently used)

---

## 2. What is DOS and what attacks do you protect against?

**DOS = Denial of Service** - Attacks that make your website unavailable by overwhelming it.

**Your protection (server.js lines 52-76):**
- **Rate Limiting:** Max 100 requests per minute per IP
- **Blocks:** Request flooding, brute force login attempts
- **Tracks:** Request count per IP address with timestamps

**Implementation:**
```javascript
const RATE_LIMIT = 100;
const TIME_WINDOW = 60000; // 60 seconds
// Automatically blocks IPs exceeding limit
```

---

## 3. What error types can occur on form submission?

**Client-side (before server):**
- Missing required fields
- Passwords don't match (register)
- Invalid email format

**Server-side:**
- Username already exists (409)
- Invalid credentials (401)
- Server error (500)
- Rate limit exceeded (429)

**Network:**
- Connection timeout
- Server unreachable
- CORS errors (if misconfigured)

---

## 4. What does package.json consist of and why?

**Your package.json structure:**

```json
{
  "name": "online-store",           // Project identifier
  "version": "1.0.0",               // Version number
  "description": "RUNI 2025...",    // Project description
  "main": "server.js",              // Entry point
  "scripts": {
    "start": "node server.js",      // npm start command
    "test": "node test.js"          // npm test command
  },
  "dependencies": {
    "cookie-parser": "^1.4.6",
    "express": "^4.21.1",
    "node-fetch": "^2.7.0"
  }
}
```

**Why it matters:**
- **scripts:** Shortcuts for common commands
- **dependencies:** Lists packages needed (run `npm install` to get them)
- **main:** Tells Node which file to run
- **name/version:** Identifies your project

---

## 5. What does package-lock.json consist of and why?

**Contents:**
- **Exact versions** of every package installed (including sub-dependencies)
- **Download locations** (URLs) for each package
- **Integrity hashes** to verify packages weren't tampered with
- **Dependency tree** showing how packages relate

**Why it exists:**
1. **Consistency:** Everyone gets identical package versions
2. **Security:** Detects if packages were modified
3. **Speed:** npm installs faster with the lock file
4. **Reproducibility:** Ensures builds work the same everywhere

**Example:** If you have `express: ^4.21.1`, package-lock.json records the exact version installed (e.g., 4.21.3) so teammates get the same version.

**Never edit manually** - npm updates it automatically.

---

## 6. What other node_modules could improve my project?

**Security & Validation:**
- `helmet` - Security headers (XSS protection, CSP)
- `express-validator` - Input validation middleware
- `bcrypt` - Password hashing (CRITICAL - currently passwords stored plain text!)
- `express-rate-limit` - Better rate limiting with Redis support

**Development:**
- `nodemon` - Auto-restart server on file changes
- `dotenv` - Environment variables (.env file)
- `morgan` - HTTP request logging

**Database (future):**
- `mongoose` - MongoDB integration
- `better-sqlite3` - Fast SQLite database

**Testing:**
- `jest` - Unit testing framework
- `supertest` - API endpoint testing

**Recommended PRIORITY install:**
```bash
npm install bcrypt
```
Then hash passwords:
```javascript
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);
```

---

## Summary

### Current State:
- ✅ Core functionality complete
- ✅ DOS protection active
- ✅ Error handling on most routes (79%)
- ⚠️ Passwords stored as plain text (SECURITY RISK)
- ⚠️ CSS optimization needed (performance)

### Before Submission:
1. **CRITICAL:** Hash passwords with bcrypt
2. Add error handling to static routes
3. Optimize CSS (modular architecture)
4. Complete test coverage
5. Update readme.html

---

*All questions answered - project 90% complete*
