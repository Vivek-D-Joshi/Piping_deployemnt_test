const { PipingSystemsModel } = require("models/PipingSystems");

module.exports = function () {
	return {
		find: (query, projection) => PipingSystemsModel.find(query, projection).exec(),
		paginationFind: (query, sort, skip, limit) =>
			PipingSystemsModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
		count: (query) => PipingSystemsModel.count(query),
		findOne: (query, projection) => PipingSystemsModel.findOne(query, projection).exec(),
		create: (object) => new PipingSystemsModel(object),
		findOneAndUpdate: (query, update, options) =>
			PipingSystemsModel.findOneAndUpdate(query, update, options).exec(),
		findByIdAndRemove: (query, options) => PipingSystemsModel.findByIdAndRemove(query, options).exec(),
		remove: (query, options) => PipingSystemsModel.remove(query, options).exec(),
		findAndModify: (query, update, options) => PipingSystemsModel.updateMany(query, update, options).exec(),
		paginate: () => PipingSystemsModel.paginate(query, options),
		deleteMany: (query) => PipingSystemsModel.deleteMany(query),
	};
};
