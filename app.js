"use strict";
exports.__esModule = true;
var express_1 = require("express");
var app = express_1["default"]();
var port = 3000;
var path_1 = require("path");
var fs_1 = require("fs");
//import querystring from "querystring"
var image_size_1 = require("image-size");
//import formidable from "formidable"
var mysql_1 = require("mysql");
var log4js_1 = require("log4js");
var cookie_parser_1 = require("cookie-parser");
var hostname = process.env.hostname ? process.env.hostname : 'localhost';
var database = process.env.database ? process.env.database : 'hogoshaj_main';
var multer_1 = require("multer");
var morePhotosPath = path_1["default"].join(__dirname, 'public/morephotos');
var photosPath = path_1["default"].join(__dirname, 'public/photos');
var reviewPath = path_1["default"].join(__dirname, 'private/photos_for_review');
var newsPath = path_1["default"].join(__dirname, 'public/news');
var imagesPath = path_1["default"].join(__dirname, 'public/stored_photos');
var documentsPath = path_1["default"].join(__dirname, 'public/documents');
// Local Modules
var db = require("./modules/db.mjs");
var webIO = require("./modules/websiteIO.mjs");
// Local Module Functions
var query = db.query;
var addPicture = webIO.addPicture;
var authresult;
var upload = multer_1["default"]({ dest: imagesPath });
app.use(express_1["default"].static('public'));
app.use(express_1["default"].urlencoded());
app.use(cookie_parser_1["default"]());
log4js_1["default"].configure({
    appenders: { everything: { type: 'file', filename: 'public/logs.log' } },
    categories: { "default": { appenders: ['everything'], level: 'ALL' } }
});
var logger = log4js_1["default"].getLogger();
app.get('/', function (req, res) {
});
app.get('/log', function (req, res) {
    // Make the log more readable
    var logpath = path_1["default"].join(__dirname, 'public/logs.log');
    fs_1["default"].readFile(logpath, function (err, data) {
        var output = "<head>\n\t\t<link rel='shortcut icon' href='images/favicon.ico' type='image/x-icon'>\n\t\t<link rel='stylesheet' href='style.css'>\n\t\t<script src='https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js'></script>\n\t\t<meta http-equiv='refresh' content='5'/>\n\t\t</head>";
        output += "\n<body>";
        var body = "";
        if (err) {
            logger.error(err);
            res.send(err);
            throw Error;
        }
        var lines = data.toString().split('\n');
        //logger.debug(lines.length)
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].includes("DEBUG")) {
                body += "\n<br><mark style=\"background-color: brown; color: black;\">" + lines[i] + "</mark>";
            }
            else if (lines[i].includes("INFO")) {
                body += "\n<br><mark style=\"background-color: green; color: black;\">" + lines[i] + "</mark>";
            }
            else if (lines[i].includes("ERROR")) {
                body += "\n<br><mark style=\"background-color: red; color: black;\">" + lines[i] + "</mark>";
            }
            else if (lines[i].includes("FATAL")) {
                body += "\n<br><b><mark style=\"background-color: dark_red; color: black;\">" + lines[i] + "</mark></b>";
            }
            else {
                body += "\n<br><mark style=\"background-color: grey; color: white;\">" + lines[i] + "</mark>";
            }
        }
        //logger.debug(body)
        res.send("" + output + body + "</body>");
    });
});
app.get("/aboutjudo", function (req, res) {
    res.sendFile(path_1["default"].join(__dirname, 'public/aboutjudo.html'));
});
app.get("/instructors", function (req, res) {
    res.sendFile(path_1["default"].join(__dirname, 'public/instructors.html'));
});
app.get("/calendar", function (req, res) {
    res.sendFile(path_1["default"].join(__dirname, 'public/calendar.html'));
});
app.get("/photos", function (req, res) {
    res.send('<meta http-equiv="refresh" content="0;url=/photos.html" />');
});
app.get("/morephotos", function (req, res) {
    res.send('<meta http-equiv="refresh" content="0;url=/morephotos.html" />');
});
app.get("/addpicturepage", function (req, res) {
    res.sendFile(path_1["default"].join(__dirname, 'public/addimage.html'));
});
app.get("/contact", function (req, res) {
    res.sendFile(path_1["default"].join(__dirname, 'public/contact.html'));
});
app.get("/subscribe", function (req, res) {
    res.sendFile(path_1["default"].join(__dirname, 'public/subscribe.html'));
});
app.get('/subscribed', function (req, res) {
    var email = req.query.email[0];
    logger.debug(email);
    fs_1["default"].readFile("private/pending_emails.txt", function (err, data) {
        if (data.toString().includes(email)) {
            res.send("<h1>That Email Already Exists!</h1>");
        }
        else {
            fs_1["default"].appendFile("private/pending_emails.txt", email + "\n", function (err) {
                if (err) {
                    logger.error("Help!");
                }
            });
            res.sendFile(path_1["default"].join(__dirname, "public/subscribe.html"));
        }
    });
});
app.get('/news', function (req, res) {
});
app.get('/documents', function (req, res) {
    res.send('<meta http-equiv="refresh" content="0;url=/documents.html" />');
});
app.get('/loginpage', function (req, res) {
    //if (req.cookies["loggedin"] == )
    res.sendFile(path_1["default"].join(__dirname, "public/login.html"));
});
app.post('/login', function (req, res) {
    var user = req.body.username;
    var password = req.body.password;
    var rememberusername = req.body.rememberme;
    if (rememberusername == "on") {
        res.cookie("username", "" + user, {
            expires: new Date(Date.now() + (2.628 * 10 ^ 9)),
            secure: true
        });
    }
    var result = false; // = AuthUser(user, password, res)
    logger.debug(authresult);
    //if (result != 502) {
    logger.debug("Result: " + result);
    res.cookie("loggedin", CreateIDFromUsername(user));
    return res.send("<h1>Logged in: " + result.toString() + "</h1>");
    //}
    //else {
    //	SendError(res, result)
    //}
});
app.post('/createarticle', function (req, res) {
    var title = req.body.title;
    var desc = req.body.desc;
    var content = req.body.content;
    var user = req.body.userid;
    var userhash = req.body.userveri;
});
app.post('/addpicture', upload.single('file'), function (req, res) {
    var filename = req.body.filename;
    var desc = req.body.desc ? req.body.desc : '';
    var file = req.body.file;
    var user = req.body.userid;
    var userhash = req.body.userhash;
    logger.info("File name: " + filename);
    logger.info("Description: " + desc);
    addPicture(1, filename, path_1["default"].join(imagesPath, "" + filename), desc, false, {
        host: "localhost",
        user: "hogoshaj_carter",
        password: "F53MiNGPB6QrXbGgEB3T",
        database: database
    });
    res.send("<h1>Success!</h1> \n<h2>You'll be redirected to the home page</h2>\n<meta http-equiv='refresh' content='5; url=/'/>");
});
/*
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
*/
app.get('*', function (req, res) {
    SendError(res, 404);
});
function AuthUser(username, password, res) {
    /*
    const query = "SELECT \`password\` AS 'pd' FROM \`users\` WHERE \`username\` = ?"
    SQLQuery(query, [username], function (result) {
        authresult = result
    })
    let authed = false

    logger.debug(`User used the username, ${username}, and attempted to login using the password, ${password}, and the actual password is: ${authresult[0].pd}`)

    if (password == authresult[0].pd) {
        logger.info(`User is authorized...`)
        authed = true

        SQLQuery(`SELECT \`user_id\` AS 'uid' FROM \`users\` WHERE \`username\` = ?`, [username], function (userID) {
            SQLQuery(`INSERT INTO \`user_token_map\` (userID, uniqueID) VALUES(${userID[0].uid}, ${RandomToken(256)})`)
        })

        
    }

    return authed
    /*

    logger.error('Something went wrong trying to connect to the mysql server...')
    logger.error('Sending error to client...')
    
    return 502
    */
}
function SQLQuery(query, placeholders, callback) {
    if (placeholders === void 0) { placeholders = []; }
    if (callback === void 0) { callback = null; }
    // Create connection to mysql server
    var con = mysql_1["default"].createConnection({
        host: "localhost",
        user: "hogoshaj_carter",
        password: "F53MiNGPB6QrXbGgEB3T",
        database: database
    });
    // Execute the connection
    con.connect();
    logger.debug("Connected!");
    // Execute the query
    con.query(query, placeholders, function (err, result) {
        if (err) {
            logger.error(err);
            throw err;
        }
        // Run the callback
        try {
            // End the connection
            con.end();
            callback(result);
        }
        catch (error) {
            // End the connection
            con.end();
            // Callback was not provided, returning instead
            return result;
        }
    });
}
function CreateIDFromUsername(username) {
    var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHJILKLMNOPQRSTUVWXYZ".split('');
    var UniqueID = 2;
    username.split('').forEach(function (letter) {
        for (var i = 0; i < alphabet.length; i++) {
            if (letter == alphabet[i]) {
                UniqueID *= i + 2;
                break;
            }
        }
    });
    logger.debug(UniqueID);
    return UniqueID;
}
function RandomToken(bits) {
    var token = '';
    for (var i = 0; i < bits; i++) {
        token += GetRandomInt(10).toString();
    }
}
function GetRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function SendError(res, errornum) {
    switch (errornum) {
        case 404: /* File not found */
            return res.status(404).sendFile(path_1["default"].join(__dirname, 'public/errors/404.html'));
        case 502: /* Bad Gateway */
            return res.status(502).sendFile(path_1["default"].join(__dirname, 'public/errors/502.html'));
        default: /* Internal Server Error -- Catch All */
            return res.status(500).sendFile(path_1["default"].join(__dirname, 'public/errors/500.html'));
    }
}
app.listen(port, hostname, function () {
    logger.info("Hogosha Judo listening at http://" + hostname + ":" + port);
    logger.info("In case the hostname doesn't work here is the env variable: " + process.env.hostname);
    logger.info("SQL Server database name: " + database);
    // More photos
    fs_1["default"].writeFile("public/morephotostemplate.html", "", function (err) {
        if (err)
            throw err;
    });
    // Photos
    fs_1["default"].writeFile("public/photostemplate.html", "", function (err) {
        if (err)
            throw err;
    });
    // More photos
    fs_1["default"].readdir(morePhotosPath, function (err, files) {
        if (err) {
            return logger.error('Unable to scan directory: ' + err);
        }
        files.forEach(function (file) {
            logger.info(file);
            var dimensions = image_size_1["default"](morePhotosPath + "/" + file);
            fs_1["default"].appendFile("public/morephotostemplate.html", "<img class=\"photosimg\" width=\"" + dimensions.width + " height=\"" + dimensions.height + "\" src=\"morephotos/" + file + "\" alt=\"test\">\n", function (err) {
                if (err)
                    throw err;
            });
        });
    });
    // Photos
    logger.debug('--------------------');
    fs_1["default"].readFile(photosPath + "/desc.txt", function (err, data) {
        logger.info("Desc.txt Contents:\n" + data.toString());
        var rows = data.toString().split("\n");
        rows.forEach(function (row) {
            var img = row.split("+")[0];
            var desc = row.split("+")[1];
            logger.info("Image Name: " + img + "\nDescription: " + desc);
            try {
                var dimensions = image_size_1["default"](photosPath + "/" + img);
                fs_1["default"].appendFile("public/photostemplate.html", "<figure><img class=\"photosimg\" width=\"" + dimensions.width + " " +
                    ("height=\"" + dimensions.height + "\" src=\"photos/" + img + "\" alt=\"test\"><br>\n<figcaption>" + desc + "</figcaption></figure>\n"), function (err) {
                    if (err)
                        throw err;
                });
            }
            catch (e) {
                logger.info("Image: \"" + img + "\", with description: \"" + desc + "\", does not exist...");
            }
        });
    });
    //News
    fs_1["default"].readdir(newsPath, function (err, files) {
        if (err) {
            return logger.error('Unable to scan directory: ' + err);
        }
        var datetime = new Date();
        var date = datetime.toISOString().slice(0, 10);
        logger.info(date);
        fs_1["default"].writeFile("public/news/newstemplate.html", "<br>\n", function (err) {
            if (err)
                throw err;
        });
        var i = 1;
        files.forEach(function (file) {
            logger.info(file);
            fs_1["default"].readFile("public/news/" + file, function (err, data) {
                file = file.replace("\r", "");
                if (file == "newstemplate.html")
                    fs_1["default"].appendFile("public/news/newstemplate.html", "<a href='/news?a=" + i + "'>" + file + "</a>\n", function (err) {
                        if (err)
                            throw err;
                    });
                i++;
            });
        });
    });
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
});
