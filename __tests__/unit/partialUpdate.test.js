const partialUpdate = require("../../helpers/partialUpdate");

describe("partialUpdate", () => {
  it("should generate a proper partial update query with two fields",
    function () {

    // partialUpdate (table, items, key, id)
    let table = "layovers";
    let items = {"city_name": "Houston", "currency": "USD"};
    let key = "layover_code";
    let id = "IAH";

    let expectedQuery = "UPDATE layovers SET city_name = $1, currency = $2 WHERE layover_code = $3 RETURNING *";
    let expectedValues = ["Houston", "USD", "IAH"];

    expect(partialUpdate(table, items, key, id).query).toEqual(expectedQuery);
    expect(partialUpdate(table, items, key, id).values).toEqual(expectedValues);
  });

  it("Should generate a proper partial update query with one field (no commas)", 
  function() {
    // partialUpdate (table, items, key, id)
    let table = "users";
    let items = {"email": "myemail@gmail.com"};
    let key = "username";
    let id = "user123";

    let expectedQuery = "UPDATE users SET email = $1 WHERE username = $2 RETURNING *";
    let expectedValues = ["myemail@gmail.com", "user123"];

    expect(partialUpdate(table, items, key, id).query).toEqual(expectedQuery);
    expect(partialUpdate(table, items, key, id).values).toEqual(expectedValues);
  });

  it("Should generate a proper partial update query with number values", 
  function() {
    // partialUpdate (table, items, key, id)
    let table = "users";
    let items = {"phone": 9995554444};
    let key = "username";
    let id = "user123";

    let expectedQuery = "UPDATE users SET phone = $1 WHERE username = $2 RETURNING *";
    let expectedValues = [9995554444, "user123"];

    expect(partialUpdate(table, items, key, id).query).toEqual(expectedQuery);
    expect(partialUpdate(table, items, key, id).values).toEqual(expectedValues);
  });

});



