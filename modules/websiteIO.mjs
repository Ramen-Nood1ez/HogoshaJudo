import { query } from './db.mjs';

export function addPicture(creatorid, file, description = '', autouse = false, constr = null) {
	const creator = creatorid
	const filepath = file
	const desc = description

	const sqlquery = "INSERT INTO `pictures` (`uploader`, `file`, `description`, `autouse`) VALUES (?, ?, ?, ?)"

	query(sqlquery, [creator, filepath, desc, autouse ? '1' : '0'], null, constr)
}