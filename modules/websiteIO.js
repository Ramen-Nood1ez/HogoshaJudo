const db = require('./db')
const query = db.query

module.exports.addPicture = (creatorid, filename, file, description = '', autouse = false, constr = null) => {
	const creator = creatorid
	const filepath = file
	const desc = description

	const sqlquery = "INSERT INTO `pictures` (`uploader`, `filename`, `file`, `description`, `autouse`) VALUES \
					" + `(${creator}, ${filename}, ${filepath}, ${desc}, ${autouse ? '1': '0'})` 

	query(sqlquery, null, null, constr)

	return sqlquery
}