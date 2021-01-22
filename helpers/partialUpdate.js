/**
 * Generates a SQL query that will be used to update database values
 *
 * - table: name of table in database   (e.g. "users"    )
 * - newData: an object with keys of columns you want to update and values with
 *          updated values  (e.g. {username: "user456", email: "abc@email.com" }    )
 * - key: the column that we query by (e.g. "id" or "username"  )
 * - id: current record ID  (e.g. "93483")
 *
 * Returns object containing a SQL database query as a string, and array of
 * string values to be updated
 *   e.g. { 
 *       query: "UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *" , 
 *       values: ["user456", "abc@email.com", "93483"] 
 *   }
 *
 */

function partialUpdate(table, newData, key, id) {
    // keep track of newData indeces
    // store all of the columns we want to update with new values
    let idx = 1;
    let columns = [];

    for (let column in newData) { 
        columns.push(`${column} = $${idx}`); // e.g. columns = ["username = $1", "email = $2"] 
        idx++; 
    }

    // build query
    let columnSubstring = columns.join(", ") // e.g. columnSubstring = "username = $1, email = $2"
    let query = `UPDATE ${table} SET ${columnSubstring} WHERE ${key} = $${idx} RETURNING *`;
    // e.g.  query = "UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *"

    let values = Object.values(newData); // e.g. values = ["user456", "abc@email.com"]
    values.push(id); // e.g. values = ["user456", "abc@email.com", "93483"]



    return { query, values }
    // e.g. { 
    //     query: "UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *" , 
    //     values: ["user456", "abc@email.com", "93483"] 
    // }

}


module.exports = partialUpdate;
