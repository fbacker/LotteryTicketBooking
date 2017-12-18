

# setup & run
```
npm install
node server.js
browser prod: http://localhost:3000/
browser dev: http://localhost:3000/blubb.html
```


# development

Edit /public/blubb*
```
$ npm run production
$ node server.js
```
Now browse to http://localhost:3000/
Changes will go thru webpack parsed to index.html


# make prod

npm run production


# deploy

.local
Git push remote

.server
forever start server.js



# Make a draw

This is a multistep progress

**Step 1: Create draw files**
1. copy list.json to server-list.json
2. create folder output
3. run $ node export.js

**Step 2: Do the draw**
1. Copy contents of output to LotteryDrawTools/Games
2. Run the application
3. Edit all lines and change 'Seed' to random number
4. Run 'Build All'

**Step 3: Export to visual aid**
1. Copy the created files (step 2) into output (step 1)
2. run $ node export-final.js
The file output/drawlist.csv is created

