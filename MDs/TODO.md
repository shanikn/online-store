## Functionality & Testing

[ ]i dont need to have a wishlist file for each user *and* wishlists file of all the users wishlists. you need to update data folder to be accurate, for every type of file.

[ ]why do you have a seperate package file called package-lock.json? what's in it and what is its usage?

[ ]what are the keywords in package.json used for? and why did you choose these ones?

[ ]why did you split the dependencies into "dependencies" and "devDependencies" ? are they not all used at the same times? oh maybe they are meant to be deleted before submission cause they are only for my personal use like for testing

[ ]create a list of parts i need to make sure are deleted before submission- not whole files necessarily but code parts such as debug prints, TODO comment etc. Keep it updated as the project files change (when you or i edit the files)

[ ]how do i use the "run and debug" left side bar option?

[ ]how do i use the "testing" option? (i guess for jest tests output results) 

[ ]make sure test.js has all important tests my teacher would like to see in my submission. i won't submit any other tests so maybe plan if i should add some of the code of other test files into test.js to use.

[ ]use ui-test-report.md and COMPREHENSIVE_TEST_REPORT.md to understand the tests results and the project current condition

[ ]go over ERROR_HANDLING_AUDIT.md and update it according to the projects current condition

[X] List all API endpoints that don't have proper error handling. ✅ DONE - See ERROR_HANDLING_AUDIT.md

[X] **ERROR HANDLING FIXES (HIGH PRIORITY - Required for submission)** ✅ COMPLETE
  [X] Add try-catch to 7 static file routes (/, /store.html, /cart.html, /admin.html, /profile.html, /checkout.html, /my-items.html)
  [X] Add global error handler middleware (before app.listen in server.js)
  [X] Add unhandledRejection handler for async errors
  [X] Add input validation to /api/contact (name, email, message required)
  [X] Add input validation to /api/profile (newUsername, email format)
  [ ] Fix persist_module getActivities() loop error handling (OPTIONAL - low impact)
  
[ ] when adding a new item as admin to the product list, i think it must choose which type of item it is so the website would know if to add the item to a collection screen(like golden hoops) and to add it to the correct filter option

[ ] consider browser resizing- make sure the website buttons and all match it

## Style Improvements

[ ] you need to keep the collections submenu open when the user is inside one of the collection screens so when he opens the side menu he can see what screen he's in

[x] make sure the dark mode toggle and any other user UI customizations are implemented using the persist/load with localStorage #makeSure

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
