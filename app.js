const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const fs = require('fs')
const querystring = require("querystring")
const sizeOf = require('image-size')
const formidable = require("formidable")
const mysql = require("mysql")
const log4js = require("log4js")

const morePhotosPath = path.join(__dirname, 'public/morephotos')
const photosPath = path.join(__dirname, 'public/photos')
const reviewPath = path.join(__dirname, 'private/photos_for_review')
const newsPath = path.join(__dirname, 'public/news')
const documentsPath = path.join(__dirname, 'public/documents')

app.use(express.static('public'))
app.use(express.urlencoded())

log4js.configure({
	appenders: { everything: { type: 'file', filename: 'public/logs.log' } },
	categories: { default: { appenders: ['everything'], level: 'ALL' } }
})

const logger = log4js.getLogger()

app.get('/', (req, res) => {
	
})

app.get('/log', (req, res) => {
	// Make the log more readable
	const logpath = path.join(__dirname, 'public/logs.log')
	
	fs.readFile(logpath, (err, data) => {
		var output = `<head>
		<link rel='shortcut icon' href='images/favicon.ico' type='image/x-icon'>
		<link rel='stylesheet' href='style.css'>
		<script src='https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js'></script>
		</head>`
		output += "\n<body>"
		var body = ""

		if (err) {
			logger.error(err)
			res.send(err)
			throw error
		}

		var lines = data.toString().split('\n')

		//logger.debug(lines.length)

		for (let i = 0; i < lines.length; i++) {
			if (lines[i].includes("DEBUG")) {
				body += `\n<br><mark style="background-color: brown; color: black;">${lines[i]}</mark>`
			}
			else if (lines[i].includes("INFO")) {
				body += `\n<br><mark style="background-color: green; color: black;">${lines[i]}</mark>`
			}
			else if (lines[i].includes("ERROR")) {
				body += `\n<br><mark style="background-color: red; color: black;">${lines[i]}</mark>`
			}
			else if (lines[i].includes("FATAL")) {
				body += `\n<br><b><mark style="background-color: dark_red; color: black;">${lines[i]}</mark></b>`
			}
			else {
				body += `\n<br><mark style="background-color: grey; color: white;">${lines[i]}</mark>`
			}
			
		}

		//logger.debug(body)
		res.send(`${output}${body}</body>`)
	})
	
})

app.get("/aboutjudo", (req, res) => {
	res.sendFile(path.join(__dirname, 'public/aboutjudo.html'))
})

app.get("/instructors", (req, res) => {
	res.sendFile(path.join(__dirname, 'public/instructors.html'))
})

app.get("/calendar", (req, res) => {
	res.sendFile(path.join(__dirname, 'public/calendar.html'))
})

app.get("/photos", (req, res) => {
	res.send('<meta http-equiv="refresh" content="0;url=/photos.html" />')
})

app.get("/morephotos", (req, res) => {
	res.send('<meta http-equiv="refresh" content="0;url=/morephotos.html" />')
})

app.get("/contact", (req, res) => {
	res.sendFile(path.join(__dirname, 'public/contact.html'))
})

app.get("/subscribe", (req, res) => {
	res.sendFile(path.join(__dirname, 'public/subscribe.html'))
})

app.get('/subscribed', (req, res) => {
	var email = req.query.email
	logger.debug(email)
	fs.readFile("private/pending_emails.txt", (err, data) => {
		if (data.toString().includes(email)) {
			res.send("<h1>That Email Already Exists!</h1>")
		}
		else {
			fs.appendFile("private/pending_emails.txt", `${email}\n`, (err) => {
				if (err) {
					logger.error("Help!")
				}
			})
			res.sendFile(path.join(__dirname, "public/subscribe.html"))
		}
	})
	
})

app.get('/news', (req, res) => {
})

app.get('/documents', (req, res) => {
	res.send('<meta http-equiv="refresh" content="0;url=/documents.html" />')
})

app.get('/loginpage', (req, res) => {
	res.sendFile(path.join(__dirname, "public/login.html"))
})

app.post('/login', (req, res) => {
	var user = req.body.username
	var password = req.body.password

	const result = AuthUser(user, password, res)
	if (result != 502) {
		logger.debug(`Result: ${result}`)
		return res.send(`<h1>Logged in: ${result.toString()}</h1>`)
	}
	else {
		SendError(res, result)
	}
})

app.post('/createarticle', (req, res) => {
	var title = req.query.title
	var desc = req.query.desc
	var content = req.query.content

	
})

app.post('/fileupload', (req, res) => {
	const directoryPath = path.join(__dirname, 'public/addimage.html')
	var form = new formidable.IncomingForm()
	var fileextension = ".jpg"

	form.parse(req, function (err, fields, files) {
		var oldpath = files.filetoupload.path
		var year = fields.date
		var desc = fields.desc
		var fileindex = 1;

		fs.readdir(photosPath, function (err, files2) {
			if (err) {
				return logger.error('Unable to scan directory: ' + err)
			}
	
			files2.forEach(function (file) {
				logger.debug(file)

				if (file.includes(year)) {
					fileindex += 1
					logger.debug(fileindex)
				}
			})
		})

		if ((files.filetoupload.name).includes(".jpg")) {
			fileextension = ".jpg"
		}
		else if ((files.filetoupload.name).includes(".png")) {
			fileextension = ".png"
		}
		
		var newpath = reviewPath + `\\${year}-${fileindex}${fileextension}`

		logger.debug(newpath)

		logger.debug(year)

		fs.rename(oldpath, newpath, function (err) {
			if (err) throw err
			res.write("File Uploaded!")
			res.end()
		})

		fs.writeFile(`private/photos_for_review/${year}-${fileindex}-desc.txt`, `${year}-${fileindex}${fileextension}+${desc}`, function (err) {
			if (err) throw err
		})

		res.write('<br><meta http-equiv="refresh" content="3;url=/addimage.html" />')
	})
})

app.get('*', function(req, res) {
	SendError(res, 404)
})

function AuthUser(username, password, res) {
	var con = mysql.createConnection({
		host: "localhost",
		user: "hogoshaj_carter",
		password: "F53MiNGPB6QrXbGgEB3T",
		database: "hogoshaj_main"
	})

	con.connect()
	logger.debug("Connected!")

	const query = "SELECT \`password\` AS 'pd' FROM \`users\` WHERE \`username\` = ?"

	let authed = false

	con.query(query, [username], function (err, result) {
		if (err) {
			logger.error(err)
			throw err
		}
		logger.debug(`User used the username, ${username}, and attempted to login using the password, ${password}, and the actual password is: ${result[0].pd}`)

		if (password == result[0].pd) {
			logger.info(`User is authorized...`)
			authed = true
		}

		/*
		if (password == result.toString()) {
			return true
		}
		else {
			return false
		}
		*/
	})

	return authed
	/*

	logger.error('Something went wrong trying to connect to the mysql server...')
	logger.error('Sending error to client...')
	
	return 502
	*/
}

function SendError(res, errornum) {
	switch (errornum) {
		case 404: /* File not found */
			return res.status(404).sendFile(path.join(__dirname, 'public/errors/404.html'))

		case 502: /* Bad Gateway */
			return res.status(502).sendFile(path.join(__dirname, 'public/errors/502.html'))
	
		default: /* Internal Server Error -- Catch All */
			return res.status(500).sendFile(path.join(__dirname, 'public/errors/500.html'))
	}
}

app.listen(port, () => {
	logger.info(`Example app listening at http://localhost:${port}`)

	// More photos
	fs.writeFile("public/morephotostemplate.html", "", function (err) {
			if (err) throw err;
	})
	// Photos
	fs.writeFile("public/photostemplate.html", "", function (err) {
		if (err) throw err;
	})
	// More photos
	fs.readdir(morePhotosPath, function (err, files) {
		if (err) {
			return logger.error('Unable to scan directory: ' + err)
		}

		files.forEach(function (file) {
			logger.info(file)

			var dimensions = sizeOf(`${morePhotosPath}/${file}`)

			fs.appendFile("public/morephotostemplate.html", `<img class="photosimg" width="${dimensions.width} height="${dimensions.height}" src="morephotos/${file}" alt="test">\n`, function (err) {
				if (err) throw err;
			})
		})
	})
	// Photos
	logger.debug('--------------------')

	fs.readFile(`${photosPath}/desc.txt`, function (err, data) {
		logger.info(`Desc.txt Contents:\n${data.toString()}`)
		let rows = data.toString().split("\n")
		rows.forEach(function (row) {
			let img = row.split("+")[0]
			let desc = row.split("+")[1]
			
			logger.info(`Image Name: ${img}\nDescription: ${desc}`)

			try {
				var dimensions = sizeOf(`${photosPath}/${img}`)

				fs.appendFile("public/photostemplate.html", `<figure><img class="photosimg" width="${dimensions.width} ` +
					`height="${dimensions.height}" src="photos/${img}" alt="test"><br>\n<figcaption>${desc}</figcaption></figure>\n`, 
					function (err) {
					if (err) throw err;
				})
			}
			catch (e) {
				logger.info(`Image: "${img}", with description: "${desc}", does not exist...`)
			}
		})
	})

	//News

	fs.readdir(newsPath, function (err, files) {
		if (err) {
			return logger.error('Unable to scan directory: ' + err)
		}
		var datetime = new Date();
		const date = datetime.toISOString().slice(0,10)
		logger.info(date);

		fs.writeFile("public/news/newstemplate.html", "<br>\n", function (err) {
			if (err) throw err;
		})
		let i = 1;

		files.forEach(function (file) {
			logger.info(file)
			
			fs.readFile(`public/news/${file}`, function (err, data) {
				file = file.replace("\r", "")
				if (file == "newstemplate.html")
				fs.appendFile("public/news/newstemplate.html", `<a href='/news?a=${i}'>${file}</a>\n`, function (err) {
					if (err) throw err;
				})
				i++;
			})
		})
	})

	/*
	files.forEach(function (file) {
		logger.info(file)

		fs.readFile(`${photosPath}/${file.split('.')[0]}.txt`, function (err, data) {
			logger.info(data.toString())
			fs.appendFile("public/photostemplate.html", ``, function (err) {
				if (err) throw err;
			})
		})
	})
	*/
})