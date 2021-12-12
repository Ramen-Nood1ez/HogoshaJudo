const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const fs = require('fs')
const querystring = require("querystring")
const sizeOf = require('image-size')
const formidable = require("formidable")

const morePhotosPath = path.join(__dirname, 'public/morephotos')
const photosPath = path.join(__dirname, 'public/photos')
const reviewPath = path.join(__dirname, 'private/photos_for_review')

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

app.get("/facebook", (req, res) => {
	res.sendFile(path.join(__dirname, 'public/facebook.html'))
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