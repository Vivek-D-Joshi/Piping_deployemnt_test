const { DrawingModel } = require("models/Drawing");
const { ProjectsModel } = require("models/Projects");
const mongoose = require("mongoose");

module.exports = function () {
	return {
		find: (query, sort) => DrawingModel.aggregate([{ $match: query }, { $sort: sort }]).exec(),
		paginationFind: async function (query, sort, skip, limit) {
			let drawing = await DrawingModel.aggregate([
				{ $match: query },
				{ $sort: sort },
				{ $skip: skip },
				{ $limit: limit },
			]).exec();
			for (let i = 0; i < drawing.length; i++) {
				const [result] = await ProjectsModel.aggregate([
					{ $match: { _id: drawing[i].projectId } },
					{
						$project: {
							floorInfo: {
								$arrayElemAt: [
									{
										$filter: {
											input: "$floorList",
											cond: { $eq: ["$$this.uuid", drawing[i].floorUUID] }, // UUID of the desired floor
										},
									},
									0,
								],
							},
						},
					},
				]);
				delete result._id;
				drawing[i]["floorInfo"] = result.floorInfo;
			}
			return drawing;
		},
		count: (query) => DrawingModel.count(query),
		findSingle: async (query) => {
			query._id = new mongoose.Types.ObjectId(query._id);
			const drawing = (await DrawingModel.findOne(query).exec()).toObject();
			const [result] = await ProjectsModel.aggregate([
				{ $match: { _id: drawing.projectId } },
				{
					$project: {
						floorInfo: {
							$arrayElemAt: [
								{
									$filter: {
										input: "$floorList",
										cond: { $eq: ["$$this.uuid", drawing.floorUUID] }, // UUID of the desired floor
									},
								},
								0,
							],
						},
					},
				},
			]);
			delete result._id;
			drawing["floorInfo"] = result.floorInfo;
			return drawing;
		},
		findOne: (query) => DrawingModel.findOne(query),
		create: (object) => new DrawingModel(object),
		findOneAndUpdate: (query, update, options) => DrawingModel.findOneAndUpdate(query, update, options).exec(),
		findByIdAndRemove: (query, options) => DrawingModel.findByIdAndRemove(query, options).exec(),
		remove: (query, options) => DrawingModel.remove(query, options).exec(),
		findAndModify: (query, update, options) => DrawingModel.updateMany(query, update, options).exec(),
		paginate: () => DrawingModel.paginate(query, options),
		deleteMany: (query) => DrawingModel.deleteMany(query),
		findLatestDrawing: (projectId) => DrawingModel.findOne({ projectId }).sort({ drawingNo: -1 }).exec(),
		sortedList: (projectId, oldDrawingNo) =>
			DrawingModel.find({ projectId, drawingNo: { $gt: oldDrawingNo } })
				.sort({ drawingNo: 1 })
				.select("_id projectId drawingNo")
				.exec(),
		drawingsByProjectId: (ids) =>
			DrawingModel.aggregate([
				{
					$match: {
						_id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
					},
				},
				{
					$group: {
						_id: null,
						projectIds: { $addToSet: "$projectId" },
					},
				},
			]).exec(),
	};
};
