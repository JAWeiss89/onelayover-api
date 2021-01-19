class ExpressError extends Error {
    constructor(message, status) {
        super(); // gives us access to all regular JS Error methods/properties
        this.message = message;
        this.status = status;
        console.log(this.stack);
    }
}

module.exports = ExpressError;