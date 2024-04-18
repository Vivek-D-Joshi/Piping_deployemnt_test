const { GenericPipeSystemsModal } = require("models/GenericPipeSystems");
const { PipeNetworkTypesModel } = require("models/PipeNetworkTypes");
const { ProductTypesModal } = require("models/ProductTypes");

module.exports = function ({ config, Services }) {
	return {
		findGenericPipeSystems: (query = {}) => {
			const aggregation = [
				{
					$lookup: {
						from: "master_pipes",
						localField: "master_pipes",
						foreignField: "_id",
						as: "master_pipes",
					},
				},
				{ $match: query },
			];
			return GenericPipeSystemsModal.aggregate(aggregation).exec();
		},
		findPipeNetworkTypes: (query) => PipeNetworkTypesModel.find(query),
		findProductTypes: (query) => ProductTypesModal.find(query),
	};
};
