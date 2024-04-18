const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
	if (req.user?.role === "admin") return next();
	res.status(403).json({ error: "Forbidden, invalid user" });
};
