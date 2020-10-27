# Trading backend

## Getting started

### Installation
```
npm install
```

### Run the application

Set an environment variable in your terminal to some long and random string.
```
export JWT_SECRET='ThisIsJustAnExampleItShouldBeLongAndRandom'
```

Then you can start the applicaton.

```
npm start
```

## Choice of technologies

### Backend framework
Express was chosen as a backend framework. One strength of Express in the development process is that the developer can use JavaScript
when working on the front-end as well as the backend, which makes the switch from back-end to front-end or vice versa smoother.

### Database
The database sqlite is used to store information about the market items and customers.
The database has only three tables The table "user" holds the data about each user, the table "item" stores data about each item available on the market and "user2item" is a table connecting users to items so that it's possible to know how many of each item each user owns.
An advantage of sqlite is it's light weight, where the database is stored in a single file.
The package sqlite-async is used as an interface to connect to sqlite. It's similar to the original sqlite3 API but it makes it possible to use promises instead of callbacks.

### Authentication
JSON Web Tokens is being used for authentication. When the user logs in a token is generated and sent back to the client. The client then uses the token in subsequent API-calls to the back-end requiring authentication. The main benefit of JWT is that it doesn't require the server to keep track of sessions.
