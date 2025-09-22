## High Priority

[ ]Make sure you use theme.css in all screens- ANALYSIS COMPLETE: cart.html has 300+ lines of duplicate CSS that need to be moved to theme.css. Other files are correctly using theme.css.

[ ]change the items price font to be normal (in all screens!) 

[ ]Organize user data into individual files-Move from single JSON to per-user files

[ ]what activity types do i need to log in the activity log in admin screen?- are these the ones needed according to the instructions?

[ ]why does it say [object Object] in the activity details column in the user activity logs?- does it need updating?

[ ]Use eslints tools- To catch all errors and fix them.

[ ]remove the actual web alert to "please login to add items to your cart" alert that pops up when clicking the "add to cart" button of an item in the store screen when not logged in

[ ]make sure readme contains: 1.store name  2.what am i selling?  3.what additional pages i added? how do you operate them?  4.was the project hard to do?  5.specify all the routes my app supports  6.explain how i tested the project #makeSure

[ ]make sure this data is persisted: 1.user details  2.cart  3.purchases  4.login activity #makeSure

[ ]make sure the 4+ additional pages i created (with functionalities? he keeps saying that..) are different from each other- just make sure they're not too similar so they're actually meaningful additions #makeSure

[ ]make sure the dark mode toggle and any other user UI customizations are implemented using the persist/load with localStorage #makeSure

## Later on

[ ]Use jest for testing

[ ]have only minimum needed scripts in package.json scripts

[ ]Make login and register style match- They have a very similar concept so they should be similar in style (theyre both simple forms)

[ ]Remove tooltips from all buttons- For styling purposes. Don’t forget to do so for both light and dark modes.

[ ]Test fake payment validation flow- Simulate spinner and success message without real gateway

[ ]Rename “shop collection” button to match its functionality- It currently redirects to the wedding collection.

[ ]Remove the “browse all collections” button

[ ]Change “start with a favorite” button text to match the actual functionality- It puts the user’s cursor in the search bar, it has nothing to do with favorites.

[ ]Add a dropdown menu to the user circle fixed button- So the user would know he’s logged in with easy access. Change it from a link to the profile screen to a drop menu like in usual websites, and add a link to the profile screen inside.

[ ]when adding a new item as admin to the product list, i think it must choose which type of item it is so the website would know if to add the item to a collection screen(like golden hoops) and to add it to the correct filter option

[ ]rewrite readme in my own (simpler) words. remove words like "e-commerce" (store that sells products)

[ ]Make the right text boxes inside the form in the checkout screen have a bit of space before the end of the form so it wont go over the edge of the form

[ ]Use nodemon- and add it to package.json

[ ]write a simple llm.html and say i used claude code to help me generating tests with jest and other tools, and helped me with the debugging overall.

[ ]in admin screen: add prefix search to the filter text box (search bar) in user activity logs

## Not a must

[ ]Rename the store- It currently has a typo (shanikjewls intead of shanikjewels), but i think we can maybe think of a better name.

[ ]when the user misses a field in the register/login form or completes a field incorrectly, other than showing the error (as it does currently- excellent, dont change that error message)=> also put the users cursor at that field for him to correct

[ ]should i add fuzzy search? (close matches for when the user has a typo) or maybe autocomplete in the search bar itself (not only suggestions)

[ ]add fade in effect on other elements  its only on the photos in the middle of the store screen

[ ]change "insider list" at the bottom of the store screen to be "Newsletter" OR delete it alltogether