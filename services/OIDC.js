const { OIDCModel } = require("models/OIDC");
const { UserModel } = require("models/Users");

module.exports = function ({ config, Services }) {
	const populateObject = { path: "userId", model: UserModel };

	return {
		find: (query, projection) => OIDCModel.find(query, projection),
		count: (query) => OIDCModel.count(query),
		findOne: (query, projection) => OIDCModel.findOne(query, projection).populate(populateObject).exec(),
		create: (object) => new OIDCModel(object),
		findByIdAndRemove: (query, options) => OIDCModel.findByIdAndRemove(query, options).exec(),
	};
};
