const app = require("./app");
const { PORT } = require("./config");

app.listen(PORT, function() {
    console.log(`Server has started on port ${PORT}`);
});