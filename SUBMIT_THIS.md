# 📦 Submission Structure

**Zip:** `<ID>_<First>_<Last>_<PartnerName>_<PartnerID>_FP25.zip`

```
project_folder/
│
├── server.js                    - Main Express server
├── persist_module.js            - Data persistence (MUST be this exact name!)
├── test.js                      - Tests ALL routes using node-fetch, print pass/fail
├── package.json                 - Dependencies (grader runs npm install)
│
├── screens/
│   ├── login-server.js          - Login/logout routes
│   ├── register-server.js       - Registration routes
│   ├── store-server.js          - Products & search routes
│   ├── cart-server.js           - Cart CRUD routes
│   ├── checkout-server.js       - Checkout & payment routes
│   ├── my-items-server.js       - Purchase history routes
│   ├── admin-server.js          - Admin activity log & product management
│   ├── wishlist-server.js       - Wishlist routes (extra feature)
│   ├── profile-server.js        - Profile routes (extra feature)
│   └── contact-server.js        - Contact form routes (extra feature)
│
├── public/
│   │
│   ├── Core Pages:
│   ├── login.html               - Login + "remember me" checkbox
│   ├── register.html
│   ├── store.html               - Products + prefix search + add to cart
│   ├── cart.html                - View cart + remove items
│   ├── checkout.html            - Review before pay
│   ├── pay.html                 - Fake payment form + success message
│   ├── my-items.html            - Purchase history
│   ├── admin.html               - Activity table + username filter + manage products
│   │
│   ├── Extra Pages (min 4):
│   ├── wishlist.html
│   ├── profile.html
│   ├── about.html
│   ├── contact.html
│   ├── collection-bracelets.html
│   ├── collection-hoops.html
│   ├── collection-wedding.html
│   │
│   ├── Required Docs:
│   ├── readme.html              ⚠️ MUST INCLUDE (see requirements below)
│   ├── llm.html                 ⚠️ MUST INCLUDE (document AI-generated code)
│   │
│   ├── styles/
│   │   └── theme.css            - All styling + dark/light mode
│   │
│   └── scripts/
│       ├── layout.js            - Common UI functions
│       └── theme.js             - Theme toggle + localStorage
│
└── data/
    ├── products.json            - Product catalog
    ├── users.json               - User accounts (includes admin/admin)
    ├── wishlists.json           - Wishlists data
    ├── contacts.json            - Contact form submissions
    └── user_data/
        ├── admin_cart.json
        ├── admin_purchases.json
        ├── admin_activity.json
        └── admin_wishlist.json
```

---

## ⚠️ FILE-SPECIFIC REQUIREMENTS

### `readme.html` MUST INCLUDE:

1. **Store name** - "ShanikJewels"
2. **What you're selling** - Handcrafted jewelry (rings, necklaces, earrings, etc.)
3. **Additional pages** - List your 7 extra pages + what they do
4. **What was hard** - Challenges you faced (be honest, like a student)
5. **Partner info** - Partner name & ID, who did what (or write "no partner - solo project")
6. **All routes** - List ALL server routes (GET/POST/PUT/DELETE /api/...)
7. **How you tested** - "Automated tests using node-fetch in test.js + manual testing"

**Style:** Write like a student - clear but not too formal. NO personal TODOs/comments!

### `llm.html` MUST INCLUDE:

- What code Claude/AI generated
- Which features AI helped with (testing, bug fixes, etc.)
- Testing framework assistance
- Any bug detection AI helped with

### `test.js` MUST:

- Test ALL dynamic routes automatically
- Use `node-fetch` to make HTTP requests
- Print which tests run + pass/fail status to stdout
- Cover minimum: register, login, products, cart, checkout, admin routes
- Your current test.js already does this perfectly! ✅

### `persist_module.js` MUST:

- Be named EXACTLY `persist_module.js` (assignment requirement)
- Handle ALL file read/write operations
- No other module should directly access files
- Your current one is perfect! ✅

### All Server Modules MUST:

- Use `async/await` for async operations ✅
- Handle errors properly (try/catch) ✅
- Use appropriate HTTP methods (GET/POST/PUT/DELETE) ✅
- Export route handlers ✅

### `package.json` MUST:

- Include all dependencies ✅
- Have `"start": "node server.js"` ✅
- Have `"test": "node test.js"` ✅
- **NO package-lock.json needed** - grader runs `npm install` to generate it

---

## ❌ DO NOT INCLUDE

```
node_modules/           - NEVER! (grader runs npm install)
package-lock.json       - Not needed (auto-generated)
.git/, .vscode/, .claude/
*.md files              - All documentation (CLAUDE.md, AGENTS.md, MDs/, etc.)
coverage/               - Test reports
fullstack final project.pdf
debug-menu.html, force-close-menu.html
eslint.config.js, jest.config.js
ccstatusline.*, reset-session.ps1
.mcp.json
$CACHE
```

---

## ✅ PRE-SUBMISSION CHECKLIST

- [x]Run through all HTML/JS files - remove `// TODO:`, `// FIXME:`, personal comments
- [x] Check readme.html - answers all 7 required points?
- [ ] Check llm.html - documents AI assistance honestly?
- [ ] NO node_modules folder in zip
- [ ] persist_module.js is exact name
- [x] Test: `npm install` works
- [x] Test: `npm start` runs server on port 5000
- [x] Test: `npm test` passes 27/28 tests
- [ ] Zip filename matches: `<ID>_<First>_<Last>_<Partner>_<PartnerID>_FP25.zip`
- [ ] Deadline: September 2nd 23:59
