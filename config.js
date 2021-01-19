require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "abc123"; // retrieve key from deployed env variable or "abc123" if running on local

const PORT = process.env.PORT || 3000; // if running on local machine, use port 3000

let DB_URI;
if (process.env.NODE_ENV === "test") { // if intesting environment,
    DB_URI = "onelayover-test"; // use test database
} else {
    // otherwise use database specified in deployed env variable or local app database
    DB_URI = process.send.DATABASE_URL || "onelayover"; 
}

module.exports = {
    SECRET_KEY,
    PORT,
    DB_URI
  };