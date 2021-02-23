// Set up config for application including secret key, what port to listen on, and what database to connect


require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "abc123"; // retrieve key from deployed env variable or "abc123" if running on local

const PORT = process.env.PORT || 3000; // if running on local machine, use port 3000

let DB_URI;
if (process.env.NODE_ENV === "test") { // if intesting environment,
    DB_URI = "onelayover_test"; // use test database called "onelayover-test"
} else {
    // otherwise use database specified in deployed env variable or local app database called "onelayover"
    DB_URI = process.send.DATABASE_URL || "onelayover"; 
}

module.exports = {
    SECRET_KEY,
    PORT,
    DB_URI
  };