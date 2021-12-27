const fs = require("fs");
if (fs.existsSync("./.env.json")) {
	const path = "./.env.json";
	require("dotenv-json")({ path });
}
const express = require("express");
const cors = require("cors");
const app = express();
const { nanoid } = require("nanoid");
const dns = require("dns");
const mongoose = require("mongoose");
const urlModel = require("./models/url");
const util = require("util");
const urlExist = util.promisify(require("url-exists"));

// Basic Configuration
const port = process.env["PORT"] || 3000;

const dbAddress = process.env["DB_URI"];

try {
	mongoose.connect(dbAddress, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	console.log("connected to mongodb");
} catch (e) {
	console.log("unable to connect to db");
	// console.log("\n\n" + e.message);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
	res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
	res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", async (req, res) => {
	// get a url from the client
	const { url } = req.body;
	// verify if url is valid
	const validUrl = await urlExist(url);
	if (!validUrl) {
		res.send({ error: "invalid url" });
		return;
	}

	// generate a short url for the url
	const shortUrl = nanoid(4);
	// save the url and its short form to db
	try {
		const newUrl = new urlModel({
			originalUrl: url,
			shortUrl,
		});
		await newUrl.save();
		// send a request containing both url to the client
		res.send({
			original_url: url,
			short_url: shortUrl,
		});
		return;
	} catch (e) {
		console.log(e.message);
	}
});

app.get("/api/shorturl/:shortCode", async (req, res) => {
	const { shortCode } = req.params;
	try {
		const url = await urlModel.findOne({ shortUrl: shortCode });
		if (!url) {
			res.send({ error: "invalid url" });
			return;
		}
		// redirect to the original url
		res.redirect(url.originalUrl);
	} catch (e) {
		console.log(e.message);
	}
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
