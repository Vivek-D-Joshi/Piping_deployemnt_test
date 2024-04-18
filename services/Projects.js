const { ProjectsModel } = require("models/Projects");

const { ObjectId } = require("mongodb");

module.exports = function ({ config, Services }) {
	return {
		find: (query, projection) => ProjectsModel.find(query, projection),
		count: (query) => ProjectsModel.count(query),
		findOne: (query, projection) => ProjectsModel.findOne(query, projection),
		findAndSortOne: (query, sort) => ProjectsModel.findOne(query).sort(sort).exec(),
		create: (object) => new ProjectsModel(object),
		findOneAndUpdate: (query, update, options) => ProjectsModel.findOneAndUpdate(query, update, options).exec(),
		findByIdAndRemove: (query, options) => ProjectsModel.findByIdAndRemove(query, options).exec(),
		deleteMany: (query) => ProjectsModel.deleteMany(query),
		remove: (query, options) => ProjectsModel.remove(query, options).exec(),
		findAndModify: (query, update, options) => ProjectsModel.updateMany(query, update, options).exec(),
		paginate: () => ProjectsModel.paginate(query, options),
	};
};
