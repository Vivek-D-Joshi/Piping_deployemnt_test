const PipingSizes = require("models/PipingSizes");
const { PipingSizesModel } = require("models/PipingSizes");
const { PrimaryUnitsModel } = require("models/PrimaryUnits");

module.exports = function ({ config, Services }) {
	const populateObject = { path: "unitId", model: "primary_units" };
	return {
		find: (query, projection) => PipingSizesModel.find(query, projection).populate(populateObject).exec(),
		paginationFind: async (query, sort, skip, limit) => {
			const pipeSizes = await PipingSizesModel.aggregate([
				{ $match: query },
				{ $sort: sort },
				{ $skip: skip },
				{ $limit: limit },
			]).exec();
			for (let i = 0; i < pipeSizes.length; i++) {
				pipeSizes[i]["unitData"] = await PrimaryUnitsModel.findOne({ _id: pipeSizes[i].unitId });
			}
			return pipeSizes;
		},
		count: (query) => PipingSizesModel.count(query),
		findOne: async (query, projection) => {
			const pipeSize = (await PipingSizesModel.findOne(query, projection).exec()).toObject();
			const unitData = (await PrimaryUnitsModel.findOne({ _id: pipeSize?.unitId }).exec()).toObject();
			if (!pipeSize) {
				return null;
			}
			pipeSize.unitData = unitData;
			return pipeSize;
		},
		create: (object) => new PipingSizesModel(object),
		findOneAndUpdate: (query, update, options) => PipingSizesModel.findOneAndUpdate(query, update, options).exec(),
		findByIdAndRemove: (query, options) => PipingSizesModel.findByIdAndRemove(query, options).exec(),
		remove: (query, options) => PipingSizesModel.remove(query, options).exec(),
		findAndModify: (query, update, options) => PipingSizesModel.updateMany(query, update, options).exec(),
		paginate: () => PipingSizesModel.paginate(query, options),
	};
};
