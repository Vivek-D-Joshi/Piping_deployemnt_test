const jwt = require("jsonwebtoken");
const { hasObjectLength } = require("utils/condition");

module.exports = async function (req, res, next, { Services: { OIDC }, config }) {
	const { secret } = config.auth;
	const bearerHeader = req.headers["authorization"];
	if (!bearerHeader) return res.status(403).json({ message: "Access denied" });
	const bearerToken = bearerHeader.replace(/^Bearer\s/, "");
	const token = bearerToken;
	try {
		const verified = await jwt.verify(token, secret);
		if (!token) {
			return res.status(401).json({ message: "No token provided" });
		}
		const oidc = await OIDC.findOne({ token });
		if (!oidc) return res.status(401).json({ message: "Token does not match with our database" });
		if (Date.now() >= verified.exp * 1000) {
			return res.status(401).json({ message: "Token has expired" });
		}
		if (!hasObjectLength(oidc?.userId)) {
			await OIDC.findByIdAndRemove({ _id: oidc?._id });
			return res.status(403).json({ message: "Forbidden!" });
		}
		delete verified?.exp;
		delete verified?.iat;
		const user = { ...oidc?.toObject?.(), ...oidc?.userId?.toObject?.(), ...verified, oidcId: oidc?._id };
		const isDisabled = oidc?.userId?.isDisabled;
		if (isDisabled) {
			await OIDC.findByIdAndRemove({ _id: oidc?._id });
			return res.status(403).json({ message: "Forbidden!" });
		}
		req.user = user;
		next();
	} catch (error) {
		res.status(403).json({ error, message: "Access denied" });
	}
};
