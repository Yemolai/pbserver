# REST-NES

A REST API Template made with Node.js, ExpressJS and Sequelize

The purpose of this code is to give speed to application development as its
foundations are defined as a template to create simple APIs in JavaScript.

This template is made with heroku deplyoment in mind, but everything should work
as fine in another platform or in a server environment as well.

This template will be converted into an yeoman generator very soon.

## Be aware

* You'll need a database (its fallback is sqlite memory, **not implemented yet**)
* There are no tests implemented yet (PR for this are welcome)
* There are no security at all in this API (don't use it in production **yet**)
* To define configuration use the .env file, there is a default.env file to help

## Dependencies

* Node.js (Event-driven non-blocking I/O fast server-side JavaScript)
* ExpressJS (Nodejs Web Application Framework to quick rest and apps development)
* Sequelize (SQL Database ORM for ease database interaction)
* Sqlite3 (fallback Database driver for in-memory temporary data storage)
* PostgreSQL (Powerful Database to Structured Data)

## Installation and use

Clone the repo
```
git clone https://www.github.com/yemolai/rest-nes
```

Enter the created folder
```
cd rest-nes
```

Install dependencies
```
npm install
```

Run it
```
npm start
```

You'll need postgres configured with your config filling the DATABASE_URL in
.env in order to connect to the database and made requests.

As default the application will run in port 5000.

The npm start is a shortcut for running ```nf start``` as Foreman is needed.

## Errors and problems
Open issues and I'll se what I can do about it

## Want to fork and enhance it?
Go on! Just do it :)
