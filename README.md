# bpm
Bussiness Process Management

## installation
```sh
$ cd path-to-your/www
$ npm install
```
```sh
$ cd path-to-your/www/public
$ bower install
```

create file mongo.js at path "www/config/"
with value 
```js
module.exports = {
    connection : {
        username : "your-remote-username", //delete this line if your mongo haven't required username
        password : "your-remote-password", //delete this line if your mongo haven't required password
        host : "localhost",
        port : 27017
    },
    database : {
        name : "databasename"
        username : "database-username", //delete this line if your database haven't required username
        password : "database-password"  //delete this line if your database haven't required password
    }
};
```

## start (cluster)
```sh
$ cd path-to-your/www
$ npm start
```
## start (single thread)
```sh
$ cd path-to-your/www
$ npm test
```
