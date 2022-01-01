const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const fs = require('fs')
const querystring = require("querystring")
const sizeOf = require('image-size')
const formidable = require("formidable")
const mysql = require("mysql")

const morePhotosPath = path.join(__dirname, 'public/morephotos')
const photosPath = path.join(__dirname, 'public/photos')
const reviewPath = path.join(__dirname, 'private/photos_for_review')
const newsPath = path.join(__dirname, 'public/news')
const documentsPath = path.join(__dirname, 'public/documents')

app.use(express.static('public'))

app.get('/', (req, res) => {
	
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
	console.log(email)
	fs.readFile("private/pending_emails.txt", (err, data) => {
		if (data.toString().includes(email)) {
			res.send("<h1>That Email Already Exists!</h1>")
		}
		else {
			fs.appendFile("private/pending_emails.txt", `${email}\n`, (err) => {
				if (err) {
					console.error("Help!")
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
	var user = req.query.username
	var password = req.query.password

	res.send("Logged in: " + AuthUser(user, password))
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
				return console.log('Unable to scan directory: ' + err)
			}
	
			files2.forEach(function (file) {
				console.log(file)

				if (file.includes(year)) {
					fileindex += 1
					console.log(fileindex)
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

		console.log(newpath)

		console.log(year)

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
	res.status(404).sendFile(path.join(__dirname, 'public/errors/404.html'))
})

function AuthUser(username, password) {
	var con = mysql.createConnection({
		host: "localhost",
		user: "hogoshaj_carter",
		password: "F53MiNGPB6QrXbGgEB3T"
	})

	con.connect(function(err) {
		if (err) throw err
		console.log("Connected!")

		con.query(`SELECT 'password' FROM 'users' WHERE 'username' = "${username}"`, function (err, result) {
			if (err) throw err
			console.log(`User used the username, ${username}, and attempted to login using the password, 
			${password}, and the actual password is: ${result}`)

			if (password == result) {
				return 'true'
			}
			else {
				return 'false'
			}
		})
	})
}

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)

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
			return console.log('Unable to scan directory: ' + err)
		}

		files.forEach(function (file) {
			console.log(file)

			var dimensions = sizeOf(`${morePhotosPath}/${file}`)

			fs.appendFile("public/morephotostemplate.html", `<img class="photosimg" width="${dimensions.width} height="${dimensions.height}" src="morephotos/${file}" alt="test">\n`, function (err) {
				if (err) throw err;
			})
		})
	})
	// Photos
	console.log('--------------------')

	fs.readFile(`${photosPath}/desc.txt`, function (err, data) {
		console.log(`Desc.txt Contents:\n${data.toString()}`)
		let rows = data.toString().split("\n")
		rows.forEach(function (row) {
			let img = row.split("+")[0]
			let desc = row.split("+")[1]
			
			console.log(`Image Name: ${img}\nDescription: ${desc}`)

			try {
				var dimensions = sizeOf(`${photosPath}/${img}`)

				fs.appendFile("public/photostemplate.html", `<figure><img class="photosimg" width="${dimensions.width} ` +
					`height="${dimensions.height}" src="photos/${img}" alt="test"><br>\n<figcaption>${desc}</figcaption></figure>\n`, 
					function (err) {
					if (err) throw err;
				})
			}
			catch (e) {
				console.log(`Image: "${img}", with description: "${desc}", does not exist...`)
			}
		})
	})

	//News

	fs.readdir(newsPath, function (err, files) {
		if (err) {
			return console.log('Unable to scan directory: ' + err)
		}
		var datetime = new Date();
		const date = datetime.toISOString().slice(0,10)
		console.log(date);

		fs.writeFile("public/news/newstemplate.html", "<br>\n", function (err) {
			if (err) throw err;
		})
		let i = 1;

		files.forEach(function (file) {
			console.log(file)
			
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
		console.log(file)

		fs.readFile(`${photosPath}/${file.split('.')[0]}.txt`, function (err, data) {
			console.log(data.toString())
			fs.appendFile("public/photostemplate.html", ``, function (err) {
				if (err) throw err;
			})
		})
	})
	*/
})