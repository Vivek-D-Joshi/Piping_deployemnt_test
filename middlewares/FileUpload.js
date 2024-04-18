const path = require("path");
const multer = require("multer");
const fs = require("fs");

var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const dir = `storage/${file?.fieldname}`;
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		cb(null, dir);
	},
	filename: (req, file, cb) => {
		let ext = path.extname(file.originalname);
		const file_name = Date.now() + ext;
		cb(null, file_name);
	},
});
const fileSizeAllowed = 20;
var upload = multer({
	storage,
	fileFilter: (req, file, callback) => callback(null, true),
	limits: { fileSize: 1024 * 1024 * fileSizeAllowed },
});

module.exports = async function (req, res, next, { Services, config }) {
	// Use the `upload` middleware to process the file upload
	return upload.any()(req, res, async function (err, data) {
		if (err instanceof multer.MulterError) {
			return res.status(400).json({ error: `${err.message} can not be more than ${fileSizeAllowed} MB`, err });
		} else if (err) {
			return res.status(500).json({ error: "An unknown error occurred", err });
		}

		// File upload was successful
		await next();
	});
};
