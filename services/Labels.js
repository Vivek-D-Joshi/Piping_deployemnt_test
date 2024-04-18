const { LabelModel } = require("../models/Labels");

module.exports = function () {
	return {
		find: (query, projection) => LabelModel.find(query, projection).exec(),
		paginationFind: (query, sort, skip, limit) => LabelModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
		count: (query) => LabelModel.count(query),
		findOne: (query, projection) => LabelModel.findOne(query, projection).exec(),
		create: (object) => new LabelModel(object),
		findOneAndUpdate: (query, update, options) => LabelModel.findOneAndUpdate(query, update, options).exec(),
		findByIdAndRemove: (query, options) => LabelModel.findByIdAndRemove(query, options).exec(),
		remove: (query, options) => LabelModel.remove(query, options).exec(),
		findAndModify: (query, update, options) => LabelModel.updateMany(query, update, options).exec(),
		paginate: () => LabelModel.paginate(query, options),
		deleteMany: (query) => LabelModel.deleteMany(query),
	};
};
