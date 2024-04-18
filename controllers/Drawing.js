/**
 * Drawing Controller
 * all drawing endpoints accessible to all will be here
 */
const Joi = require("joi");
const { hasTextLength } = require("utils/condition");

module.exports.globalMiddlewares = ["VerifyToken"];
module.exports.routes = function (props) {
	const {
		Services: { Drawing, Projects, Pagination, Utility },
	} = props;
	return {
		"GET /:id": {
			localMiddlewares: ["IsUserProject"],
			handler: async function (req, res) {
				try {
					const _id = req.params.id;
					const query = { _id };
					if (!Utility.isValidObjectId(_id)) {
						return res.status(400).json({
							success: false,
							message: `Invalid drawing id`,
						});
					}
					const data = await Drawing.findSingle(query);
					if (!data) {
						return res.status(400).json({
							success: false,
							message: `Cannot find drawing with the id: ${_id}.`,
						});
					}
					return res.status(200).json({ success: true, data });
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"GET /": {
			handler: async function (req, res) {
				try {
					const query = await Utility.getProjectIdFilter(req);
					const searchKeys = ["pageNo", "title", "floor"];
					const data = await Pagination({ req, model: Drawing, searchKeys, query });
					return res.status(200).json(data);
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"POST /": {
			localMiddlewares: ["IsUserProject"],
			handler: async function (req, res) {
				try {
					const body = req.body;
					const { error } = validate(body, false);
					if (error) return res.status(400).json({ success: false, error: error.details[0].message });
					const projectId = body?.projectId;
					const floorUUID = body?.floorUUID;
					const floor = await Projects.findOne({
						_id: projectId,
						floorList: {
							$elemMatch: {
								uuid: floorUUID || "",
							},
						},
					});
					if (!floor) {
						return res.status(400).json({
							success: false,
							message: `Cannot find floor with the id: ${floorUUID}.`,
						});
					}
					const latestDrawing = await Drawing.findLatestDrawing(projectId);
					body.drawingNo = (latestDrawing?.drawingNo ?? 0) + 1;
					const drawing = await Drawing.create(body);
					const data = await drawing.save();
					return res.status(200).json({
						success: true,
						message: `drawing has been added successfully!`,
						data,
					});
				} catch (error) {
					if (error.code === 11000) {
						return res
							.status(400)
							.json({ success: false, message: "Drawing already exist with same data or drawingRefNo" });
					}
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"PUT /:id": {
			localMiddlewares: ["IsUserProject"],
			handler: async function (req, res) {
				try {
					const body = req.body;
					const _id = req.params.id;
					if (!Utility.isValidObjectId(_id)) {
						return res.status(400).json({
							success: false,
							message: `Invalid drawing id.`,
						});
					}
					const floor = await Projects.findOne({
						_id: body?.projectId,
						floorList: {
							$elemMatch: {
								uuid: body?.floorUUID || "",
							},
						},
					});
					if (!floor) {
						return res.status(400).json({
							success: false,
							message: `Cannot find floor with the id: ${body?.floorUUID}.`,
						});
					}
					const query = { _id };
					const drawing = await Drawing.findOne(query);
					if (!drawing) {
						return res.status(400).json({
							success: false,
							message: `Cannot find drawing with the id: ${_id}.`,
						});
					}
					const { error } = validate(body, true);
					if (error) return res.status(400).json({ success: false, error: error.details[0].message });
					const data = await Drawing.findOneAndUpdate(query, body, { new: true, strict: false });
					return res.status(200).json({
						success: true,
						message: `Drawing has been updated successfully!`,
						data,
					});
				} catch (error) {
					if (error.code === 11000) {
						return res.status(500).json({
							success: false,
							message: "Record already exist with same data or drawingRefNo",
							error: error.message,
						});
					}
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"DELETE /:id": {
			localMiddlewares: ["IsUserProject"],
			handler: async function (req, res) {
				try {
					const _id = req.params.id;
					const query = { _id };
					if (!Utility.isValidObjectId(_id)) {
						return res.status(400).json({
							success: false,
							message: `Invalid drawing id: ${_id}.`,
						});
					}
					const drawing = await Drawing.findOne(query);
					if (!drawing) {
						return res.status(400).json({
							success: false,
							message: `Cannot find drawing with the id: ${_id}.`,
						});
					}
					await Drawing.findByIdAndRemove(query);

					const drawingList = await Drawing.sortedList(drawing.projectId, drawing.drawingNo);
					drawingList.forEach(async (data) => {
						data.drawingNo--;
						await Drawing.findOneAndUpdate(
							{ projectId: data.projectId, _id: data._id },
							{ $set: { drawingNo: data.drawingNo } }
						);
					});

					return res.status(200).json({
						success: true,
						message: `Drawing deleted successfully!`,
					});
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"POST /delete/multiple": {
			handler: async function (req, res) {
				try {
					const { ids } = req.body;

					const validationResult = await Utility.validateIds({ req, res, model: Drawing });
					if (!validationResult.success) {
						return res.status(400).json({ success: false, message: validationResult.message });
					}
					//get projectIds of diffrent drawings
					const [{ projectIds }] = await Drawing.drawingsByProjectId(ids);

					//delete records
					const result = await Drawing.deleteMany({ _id: { $in: ids } });
					if (result.deletedCount === 0) {
						return res.status(404).json({ success: false, error: "No items data with the provided IDs." });
					}

					//update drawingNo.
					for (const projectId of projectIds) {
						const filter = { projectId };
						const sortBy = { drawingNo: 1 };
						const drawingList = await Drawing.find(filter, sortBy);
						for (const [index, data] of drawingList.entries()) {
							data.drawingNo = index + 1;
							const result = await Drawing.findOneAndUpdate(
								{ projectId: data.projectId, _id: data._id },
								{ $set: { drawingNo: data.drawingNo } }
							);
						}
					}
					return res.status(200).json({ success: true, message: `Multiple data deleted successfully!` });
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
	};
};

const validate = (data, isUpdate = false) => {
	const add = Joi.object({
		drawingRefNo: Joi.string().required(),
		title: Joi.string().required(),
		floorUUID: Joi.string().required(),
		isViewEnabled: Joi.boolean(),
		isFrameEnabled: Joi.boolean(),
		drawingInfo: Joi.object().default({}),
		projectId: Joi.string(),
	});
	const update = Joi.object({
		drawingRefNo: Joi.string().required(),
		title: Joi.string().required(),
		floorUUID: Joi.string().required(),
		isViewEnabled: Joi.boolean(),
		isFrameEnabled: Joi.boolean(),
		drawingInfo: Joi.object().default({}),
		projectId: Joi.string(),
	});
	const schema = isUpdate ? update : add;
	return schema.validate(data, { stripUnknown: true });
};
