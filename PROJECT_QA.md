# Project Q&A Documentation - ShaniknJewls Online Store

## 1. Why are there 2 different node_modules directories?

**Answer:** You have two node_modules because:
- **Root node_modules** (`/node_modules/`) - Contains server-side dependencies for your Express.js backend (cookie-parser, express, cors, node-fetch)
- **Client node_modules** (`/client/node_modules/`) - Was created when we started (but then abandoned) the React conversion. This is NOT needed for your project.

**Action:** You can safely delete the entire `/client` directory - it's leftover from the React attempt we didn't complete.

## 2. Is the cookie name 'userToken' standard? Should I personalize it?

**Answer:**
- `userToken` is a generic but acceptable name
- Common alternatives: `sessionId`, `authToken`, `sid`, `auth`
- You CAN personalize it to `shaniknjewls_session` or `snj_auth` if you want
- **Important:** If you change it, update it everywhere in server.js (currently appears in ~5 places)

## 3. What's the user-accessible UI customization in my project?

**Answer:** Currently, your project has minimal UI customization:
- **What's implemented:** Remember username feature (localStorage)
- **What's missing:** Theme customization (like dark mode)
- **PDF Requirement:** "User-configurable theme stored in localStorage"

To fully meet requirements, you could add a simple dark mode toggle that saves preference in localStorage. This would satisfy the "UI customization" requirement your teacher mentioned.

## 4. Why was the client directory created with React files?

**Answer:**
- We started converting your project to React (modern framework) midway through
- You decided to stick with vanilla HTML/JS to meet your deadline
- The `/client` directory contains an incomplete React setup:
  - `node_modules` - React dependencies
  - `public` - React's public assets folder
  - `src` - React source code
  - `package.json` - React project configuration

**Action:** DELETE the entire `/client` folder - it's not part of your working project.

## 5. What node_modules are actually used in your project?

**Your project uses these npm packages:**

| Package | Where Used | Purpose |
|---------|------------|---------|
| **express** | server.js | Web server framework, handles HTTP requests/responses |
| **cookie-parser** | server.js | Parses cookies from requests for authentication |
| **cors** | server.js (commented) | Would enable cross-origin requests (for React) |
| **node-fetch** | test.js | Enables HTTP requests in your test suite |

These are installed in your root `/node_modules` directory and listed in `/package.json`.

## 6. Should we rename one of the 'public' directories?

**Answer:**
- **Root `/public`** - Your ACTUAL project files (all HTML pages)
- **Client `/client/public`** - React's public folder (NOT USED)

**Solution:** Delete the entire `/client` directory. This removes the confusion entirely. You only need the root `/public` folder.

## 7. What are the files in client/public/?

The `/client/public/` contains React boilerplate files:
- `index.html` - React's root HTML file
- `manifest.json` - Web app manifest for React
- `robots.txt` - Search engine instructions
- `favicon.ico` - React's default icon

**These are NOT used in your project.** They're React-specific files that can be deleted.

## 8. What is DOS and what attacks do you protect against?

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