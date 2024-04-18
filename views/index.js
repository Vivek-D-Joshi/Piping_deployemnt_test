module.exports = function (app) {
	app.get("/AdminLogin", (req, res) => res.render("AdminLogin"));
	app.get("/Login", (req, res) => res.render("UserLogin"));
};
