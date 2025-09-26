## Functionality & Testing

[X] List all API endpoints that don't have proper error handling. ✅ DONE - See ERROR_HANDLING_AUDIT.md

[ ] **ERROR HANDLING FIXES (HIGH PRIORITY - Required for submission)**
  [ ] Add try-catch to 7 static file routes (/, /store.html, /cart.html, /admin.html, /profile.html, /checkout.html, /my-items.html)
  [ ] Add global error handler middleware (before app.listen in server.js)
  [ ] Add unhandledRejection handler for async errors
  [ ] Add input validation to /api/contact (name, email, message required)
  [ ] Add input validation to /api/profile (newUsername, email format)
  [ ] Fix persist_module getActivities() loop error handling
  
[ ] when adding a new item as admin to the product list, i think it must choose which type of item it is so the website would know if to add the item to a collection screen(like golden hoops) and to add it to the correct filter option

[ ] consider browser resizing- make sure the website buttons and all match it

## Style Improvements

[ ] you need to keep the collections submenu open when the user is inside one of the collection screens so when he opens the side menu he can see what screen he's in

[ ] make sure the dark mode toggle and any other user UI customizations are implemented using the persist/load with localStorage #makeSure

[ ] Make the right text boxes inside the form in the checkout screen have a bit of space before the end of the form so it wont go over the edge of the form

[ ] add fade in effect on other elements  its only on the photos in the middle of the store screen

## Not a must

[ ] when the user misses a field in the register/login form or completes a field incorrectly, other than showing the error (as it does currently- excellent, dont change that error message)=> also put the users cursor at that field for him to correct

[ ] Use nodemon?- and add it to package.json

---

## Current Status
- ⏳ Waiting for Claude Code to fix 2 failing tests (admin product deletion + wishlist validation)
- 📋 Error handling audit complete - ready to implement fixes
- 🎯 Next: Fix error handling issues (15-30 min estimated)
