const mysql = require("../node_modules/mysql")

function query(query, placeholders = [], callback = null, constr = null) {
	// Create connection to mysql server
	var con = mysql.createConnection(constr ? constr : {
		host: "localhost",
		user: "hogoshaj_carter",
		password: "F53MiNGPB6QrXbGgEB3T",
		database: "hogoshaj_main"
	})

	// Execute the connection
	con.connect()
	// Execute the query
	con.query(query, placeholders, function (err, result) {
		if (err) {
			throw err
		}
		// Run the callback
		try {
			// End the connection
			con.end()
			callback(result)
		} catch (error) {
			// End the connection
			con.end()
			// Callback was not provided, returning instead
			return result
		}
	})
}

export { query }