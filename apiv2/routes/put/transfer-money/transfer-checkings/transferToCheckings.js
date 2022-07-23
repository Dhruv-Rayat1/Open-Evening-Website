// Like in the index.js page we are importing the express library as a var called express
const express = require("express");
let router = express.Router(); // This is a route, we are simply just using a let var and exporting it so we can split up our code and makeing it easier to read
// This is the node js lirary I've chosen to go with to query my SQL server
const { Pool, Client } = require("pg");
require("dotenv").config({ path: "../../../.env" }); // dot env

// authentication middleware
const auth = require("../../../auth/middleWareAuth");

// Here we can accept json as a valid body object
router.use(express.json());

// This is the connection string to my Database, I am using this with the PG node js library so
// I can query the database. Also, the database is a MySQL Postgre server
const connectionString = process.env.CONNECTIONSTRING;

router.put("/:username", auth.authenticateToken, (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      res.json({ result: "Body is Empty" });
    }
  } catch (ex) {
    res.json(ex);
  }

  let notMoney = false;

  const amount = req.body.amount;

  if (amount <= 0 || isNaN(amount)) {
    notMoney = true;
  }

  const cleint = new Client({
    connectionString,
  });

  cleint.connect();

  const userName = req.params.username;

  const enoughMoneyQuery = "SELECT savings FROM users WHERE username=$1";
  const enoughMoneyValues = [userName];

  cleint.query(
    enoughMoneyQuery,
    enoughMoneyValues,
    (existsErr, existsSqlRes) => {
      if (existsErr) {
        res.status(500).json({ result: "Internal Server Error" });
      } else {
        var amountInSavings = existsSqlRes.rows[0].savings;
        if (amount > amountInSavings) {
          res.status(400).json({ result: "Insufficient funds" });
        } else {
          const existsQuery =
            "SELECT EXISTS(SELECT * from users WHERE username=$1);";
          const existsValues = [userName];
          cleint.query(existsQuery, existsValues, (err, sqlRes) => {
            if (err) {
              res.status(500).json({ result: "Internal Server Error" });
            } else if (sqlRes.rows[0].exists === true) {
              if (notMoney == false) {
                const updateQuery =
                  "UPDATE users SET checkings=checkings+$1, savings=savings-$2 WHERE username=$3";
                const updateValues = [amount, amount, userName];
                cleint.query(
                  updateQuery,
                  updateValues,
                  (error, sqlResponse) => {
                    if (error) {
                      res.status(500).json({ result: "Internal Server Error" });
                    } else {
                      res.status(201).json({
                        result: `Successfully added ${amount} to '${userName}' checkings.`,
                      });
                    }
                  }
                );
              } else {
                res
                  .status(500)
                  .json({ result: "Amount provided is null or nothing" });
              }
            } else {
              res
                .status(400)
                .json({ result: "User does not exist in the database" });
            }
          });
        }
      }
    }
  );
});

module.exports = router;
