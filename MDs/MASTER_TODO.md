# Master TODO - Project Completion Plan

## 🎯 Priority 1: MUST DO Before Submission

### A. Data Structure Cleanup
- [ ] **Remove duplicate user wishlist files** - Each user should have ONE wishlist file in their user folder, NOT separate wishlists.json
- [ ] **Audit data folder structure** - Verify only necessary files exist per user

### B. Error Handling (CRITICAL)
- [ ] Add try-catch blocks to 7 static file routes:
  - [ ] GET / (index/store)
  - [ ] GET /store.html
  - [ ] GET /cart.html
  - [ ] GET /admin.html
  - [ ] GET /profile.html
  - [ ] GET /checkout.html
  - [ ] GET /my-items.html
- [ ] Verify global error handler is active
- [ ] Test unhandledRejection handler

### C. Product Type/Category System
- [ ] **Add product type field** to product schema
- [ ] Update admin product creation to include type selection
- [ ] Link products to collections (Wedding, Bracelets, Hoops)
- [ ] Update filter logic to use product types

### D. CSS Optimization (HIGH IMPACT)
- [ ] Break theme.css into modular files:
  - [ ] theme-core.css (header, nav, footer, buttons, forms)
  - [ ] Move store-specific CSS to store.html
  - [ ] Move cart CSS to cart.html
  - [ ] Move admin CSS to admin.html
  - [ ] Move profile CSS to profile.html

### E. Test.js Enhancement
- [ ] Review what tests exist in other test files
- [ ] Add critical tests to test.js (it's the only one submitted)
- [ ] Ensure coverage of:
  - [ ] All HTTP methods (GET/POST/PUT/DELETE)
  - [ ] Auth flows
  - [ ] Cart operations
  - [ ] Admin functions
  - [ ] Error cases

## 🎨 Priority 2: UI/UX Polish

### A. Navigation
- [ ] **Keep collections submenu open** when user is on a collection page
- [ ] Add visual indicator for current page in side menu

### B. Form Improvements
- [ ] **Auto-focus on error fields** in login/register forms
- [ ] Fix checkout form text boxes spacing (right side touching edge)

### C. Responsive Design
- [ ] Test all pages on mobile viewport
- [ ] Verify buttons and layout adapt to screen size
- [ ] Check fade-in effects consistency

## 📚 Priority 3: Documentation & Cleanup

### A. Pre-Submission Cleanup List
- [ ] Remove all console.log() debug statements
- [ ] Remove TODO comments from code
- [ ] Remove test data or test users (except admin)
- [ ] Delete unused files/code
- [ ] Verify no sensitive data in commits

### B. Package.json Understanding
- [ ] Document package-lock.json purpose
- [ ] Document keywords rationale
- [ ] Document dependencies vs devDependencies split
- [ ] Confirm devDependencies removal strategy

### C. Update Documentation
- [ ] Update readme.html with final routes
- [ ] Update llm.html with AI-generated code sections
- [ ] Document testing approach in readme

## 🔧 Priority 4: Optional Enhancements

- [ ] Add nodemon to devDependencies
- [ ] Set up VS Code "Run and Debug" config
- [ ] Configure VS Code Testing panel for Jest
- [ ] Implement fade-in effects on all pages (not just store)

---

## 📊 Project Analysis Findings

### Code Issues Found:
1. **Data Structure:** Duplicate wishlist storage (per-user AND global)
2. **Product Management:** No type/category system for collections
3. **CSS:** theme.css too large (3500+ lines)
4. **Error Handling:** 7 routes missing try-catch

### Testing Gaps:
- Need comprehensive test.js (only file submitted)
- Should include edge cases and error scenarios

### Documentation Needs:
- Cleanup checklist
- Package.json explanations
- Updated route table

---

## ⏱️ Time Estimates
- Data cleanup: 15 min
- Error handling: 15 min  
- Product types: 30 min
- CSS optimization: 1-2 hours
- test.js updates: 45 min
- UI polish: 30 min
- Documentation: 30 min

**Total: 4-5 hours to completion**
