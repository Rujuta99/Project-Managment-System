
const mysql = require("mysql2");
const neo4j = require("neo4j-driver");
require("dotenv").config();

// MySQL configuration
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database!");
});


// Neo4j configuration
const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD) // Replace with your password
);

const neo4jSession = neo4jDriver.session();

neo4jSession
  .run('RETURN "Neo4j Connection Successful" AS message')
  .then((result) => {
    console.log(result.records[0].get("message"));
  })
  .catch((error) => console.error("Neo4j Connection failed", error));

// Export both connections
module.exports = {
  connection,
  neo4jSession,
};
