

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
