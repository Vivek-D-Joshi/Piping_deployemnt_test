const { PrimaryUnitsModel } = require("models/PrimaryUnits");

module.exports = function ({ config, Services }) {
	return {
		find: (query, projection) => PrimaryUnitsModel.find(query, projection),
		paginationFind: (query, sort, skip, limit) =>
			PrimaryUnitsModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
		count: (query) => PrimaryUnitsModel.count(query),
		findOne: (query, projection) => PrimaryUnitsModel.findOne(query, projection),
		create: (object) => new PrimaryUnitsModel(object),
		findOneAndUpdate: (query, update, options) => PrimaryUnitsModel.findOneAndUpdate(query, update, options).exec(),
		findByIdAndRemove: (query, options) => PrimaryUnitsModel.findByIdAndRemove(query, options).exec(),
		remove: (query, options) => PrimaryUnitsModel.remove(query, options).exec(),
		findAndModify: (query, update, options) => PrimaryUnitsModel.updateMany(query, update, options).exec(),
		paginate: () => PrimaryUnitsModel.paginate(query, options),
	};
};
