## TODOs

[ ]make sure the users.html file is actually used, the admin panel should use it when showing the usernames of the existing users

[ ]Make sure you use theme.css in all screens- ANALYSIS COMPLETE: cart.html has 300+ lines of duplicate CSS that need to be moved to theme.css. Other files are correctly using theme.css.

[ ] List all API endpoints that don't have proper error handling. 

[ ]remove all jest related things from my project, i dont use it anyway

[ ]do i need package-lock.json? if so do i need to submit it in my project so my teacher could run the project?

[ ]do i need server.log? if not, delete it

[ ]do i need install-deps.bat ? if not, delete it

[ ]do i need .prettierrc ? if not, delete it

[ ]do i need eslint.config.js ? if not, delete it

[ ]do i need .eslintrc.js ? if not, delete it

[ ]you need to keep the collections submenu open when the user is inside one of the collection screens so when he opens the side menu he can see what screen he's in

[ ]remove the "quick actions" section in profile screen

[ ]in the contact screen you need to start the text box text a bit more to the right so it wont be cut

[ ]in cart screen: replace the pill button of "view cart" to be "view wishlist" or something like that

[ ]Use eslints tools- To catch all errors and fix them.

[ ]make sure readme contains: 1.store name  2.what am i selling?  3.what additional pages i added? how do you operate them?  4.was the project hard to do?  5.specify all the routes my app supports  6.explain how i tested the project #makeSure

[ ]make sure this data is persisted: 1.user details  2.cart  3.purchases  4.login activity #makeSure

[ ]make sure the 4+ additional pages i created (with functionalities? he keeps saying that..) are different from each other- just make sure they're not too similar so they're actually meaningful additions #makeSure

[ ]make sure the dark mode toggle and any other user UI customizations are implemented using the persist/load with localStorage #makeSure

[ ]have only minimum needed scripts in package.json scripts (like i think dev isnt needed)

[ ]Make login and register style match- They have a very similar concept so they should be similar in style (theyre both simple forms)

[ ]Test fake payment validation flow- Simulate spinner and success message without real gateway

[ ]Rename “shop collection” button to match its functionality- It currently redirects to the wedding collection.

[ ]Remove the “browse all collections” button

[ ]Change “start with a favorite” button text to match the actual functionality- It puts the user’s cursor in the search bar, it has nothing to do with favorites.

[ ]when adding a new item as admin to the product list, i think it must choose which type of item it is so the website would know if to add the item to a collection screen(like golden hoops) and to add it to the correct filter option

[ ]Make the right text boxes inside the form in the checkout screen have a bit of space before the end of the form so it wont go over the edge of the form

[ ]Rename the store- It currently has a typo (shanikjewls intead of shanikjewels), but i think we can maybe think of a better name.


## Not a must

[ ]when the user misses a field in the register/login form or completes a field incorrectly, other than showing the error (as it does currently- excellent, dont change that error message)=> also put the users cursor at that field for him to correct

[ ]add fade in effect on other elements  its only on the photos in the middle of the store screen

[ ]change "insider list" at the bottom of the store screen to be "Newsletter" OR delete it alltogether

[ ]Use nodemon- and add it to package.json

[ ]Add a dropdown menu to the user circle fixed button- So the user would know he’s logged in with easy access. Change it from a link to the profile screen to a drop menu like in usual websites, and add a link to the profile screen inside.
