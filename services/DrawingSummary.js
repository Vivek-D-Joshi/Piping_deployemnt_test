const { DrawingSummaryModel } = require("models/DrawingSummary");

module.exports = function () {
	return {
		find: (query, projection) => DrawingSummaryModel.find(query, projection).exec(),
		paginationFind: (query, sort, skip, limit) =>
			DrawingSummaryModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
		count: (query) => DrawingSummaryModel.count(query),
		findOne: (query, projection) => DrawingSummaryModel.findOne(query, projection).exec(),
		create: (object) => new DrawingSummaryModel(object),
		findOneAndUpdate: (query, update, options) =>
			DrawingSummaryModel.findOneAndUpdate(query, update, options).exec(),
		findByIdAndRemove: (query, options) => DrawingSummaryModel.findByIdAndRemove(query, options).exec(),
		remove: (query, options) => DrawingSummaryModel.remove(query, options).exec(),
		findAndModify: (query, update, options) => DrawingSummaryModel.updateMany(query, update, options).exec(),
		paginate: () => DrawingSummaryModel.paginate(query, options),
		deleteMany: (query) => DrawingSummaryModel.deleteMany(query),
	};
};
