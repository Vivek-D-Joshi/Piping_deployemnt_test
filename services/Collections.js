const { CollectionModel } = require("../models/Collections");

module.exports = function () {
	return {
		find: (query, projection) => CollectionModel.find(query, projection).exec(),
		paginationFind: (query, sort, skip, limit) =>
			CollectionModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
		count: (query) => CollectionModel.count(query),
		findOne: (query, projection) => CollectionModel.findOne(query, projection).exec(),
		create: (object) => new CollectionModel(object),
		findOneAndUpdate: (query, update, options) =>
			CollectionModel.findOneAndUpdate(query, update, options).exec(),
		findByIdAndRemove: (query, options) => CollectionModel.findByIdAndRemove(query, options).exec(),
		remove: (query, options) => CollectionModel.remove(query, options).exec(),
		findAndModify: (query, update, options) => CollectionModel.updateMany(query, update, options).exec(),
		paginate: () => CollectionModel.paginate(query, options),
		deleteMany: (query) => CollectionModel.deleteMany(query),
	};
};
