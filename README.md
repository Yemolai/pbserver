# pbServer

A REST API Template made with Node.js, ExpressJS and Sequelize based on rest-NES

This REST API was made to use for pathBUS mobile application.

## Dependencies

* Node.js (Event-driven non-blocking I/O fast server-side JavaScript)
* ExpressJS (Nodejs Web Application Framework to quick rest and apps development)
* Sequelize (SQL Database ORM for ease database interaction)
* Sqlite3 (fallback Database driver for in-memory temporary data storage)
* PostgreSQL (Powerful Database to Structured Data)

## Installation and use

Clone the repo
```
git clone https://www.github.com/yemolai/pbserver
```

Enter the created folder
```
cd pbserver
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
