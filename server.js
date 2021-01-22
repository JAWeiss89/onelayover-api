// Specify what port app will be listening on

const app = require("./app");
const { PORT } = require("./config");

// PORT will be retrieved from environment variable if specified or 3000

app.listen(PORT, function() {
    console.log(`Server has started on port ${PORT}`);
});