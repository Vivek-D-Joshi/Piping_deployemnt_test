const { ProjectCommandsModel } = require("models/ProjectCommands");

module.exports = function ({ config, Services }) {
	return {
		find: (query, projection) => ProjectCommandsModel.find(query, projection),
		count: (query) => ProjectCommandsModel.count(query),
		findOne: (query, projection) => ProjectCommandsModel.findOne(query, projection),
		create: (object) => new ProjectCommandsModel(object),
		findOneAndUpdate: (query, update, options) =>
			ProjectCommandsModel.findOneAndUpdate(query, update, options).exec(),
		findAndModify: (query, update, options) => ProjectCommandsModel.updateMany(query, update, options).exec(),
		findByIdAndRemove: (query, options) => ProjectCommandsModel.findByIdAndRemove(query, options).exec(),
		remove: (query, options) => ProjectCommandsModel.remove(query, options).exec(),
		paginate: () => ProjectCommandsModel.paginate(query, options),
	};
};
