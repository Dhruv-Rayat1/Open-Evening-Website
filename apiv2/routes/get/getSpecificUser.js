// Like in the index.js page we are importing the express library as a var called express
const express = require("express");
let router = express.Router(); // This is a route, we are simply just using a let var and exporting it so we can split up our code and makeing it easier to read
// This is the node js lirary I've chosen to go with to query my SQL server
const { Client } = require("pg");
require("dotenv").config({ path: "../../.env" }); // dot env

// authentication middleware
const auth = require("../auth/middleWareAuth");

// Here we can accept json as a valid body object
router.use(express.json());

// This is the connection string to my Database, I am using this with the PG node js library so
// I can query the database. Also, the database is a MySQL Postgre server
const connectionString = process.env.CONNECTIONSTRING;

// Here is the endpoint to get all the users from the database
// req is the name I've given to the request variable.
// res is the name I've given to the response varaible.
router.get("/:username", auth.authenticateToken, (req, res) => {
  // Here I am creating a constructor with the value of @connectionString const so I can connect
  const client = new Client({
    connectionString,
  });

  // Username from the Req parameter
  const userName = req.params.username;

  let query = "SELECT * FROM users WHERE username = $1";
  const values = [userName];

  if (userName == null || userName == "") {
    res.status(400).json({ result: "please provid username" });
  } else {
    client.connect();
    // This is the query callback function, it takes 1 parameter
    // @query 'SELECT ...' or 'INSERT INTO...' it can also take parameters with the $1 variable
    // client.query (query, values)...
    // A call back is a new form of ES6 Javascript syntax
    // Old syntax:
    // client.query('SELECT...' function(req, sqlRes) {...})
    // New syntax
    // client.query('SELECT...',  (req, sqlRes) => {})
    client.query(query, values, (err, sqlRes) => {
      // Here we are checking for errors, if we get the, then we throw an 500 status code and an Internal Server Error
      if (err) {
        res.status(500).json({ result: "Internal Server Error" });
      } else {
        // If sqlRes.rowCount === 0, then we know it returned nothing, so we set status to 404, and send user not found error
        if (sqlRes.rowCount === 0) {
          res.status(404).json({ result: "user not found" });
        } else {
          res.json(sqlRes.rows); // This is getting all the rows returned from the table 'users'
          client.end();
        }
      }
    });
  }
});

// Exporting the module so we can use this from the index.html page
module.exports = router;
