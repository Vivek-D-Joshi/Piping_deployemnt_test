/**
 * Collection Controller
 * all collection endpoints accessible to all will be here
 */
const Joi = require("joi");
const path = require("path");

module.exports.globalMiddlewares = ["VerifyToken"];
module.exports.routes = function (props) {
	const {
		Services: { Collections, Projects, Pagination, Utility, ProjectCommands },
	} = props;
	return {
		"GET /:id": {
			localMiddlewares: ["IsUserProject"],
			handler: async function (req, res) {
				try {
					const _id = req.params.id;
					const query = { _id };
					const data = await Collections.findOne(query);
					if (!data) {
						return res.status(400).json({
							success: false,
							message: `Cannot find collection with the id: ${_id}.`,
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
					const searchKeys = ["label"];
					const data = await Pagination({ req, model: Collections, searchKeys, query });
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

					const projectCommands = await isProjectCommandExist(body?.projectCommands, ProjectCommands);
					if (!projectCommands.success) {
						return res.status(400).json({
							...projectCommands,
							message: "Invalid project command uuid",
						});
					}
					const collection = await Collections.create(body);
					const data = await collection.save();
					return res.status(200).json({
						success: true,
						message: `collection has been added successfully!`,
						data,
					});
				} catch (error) {
					if (error.code === 11000) {
						return res
							.status(400)
							.json({ success: false, message: "collection already exist with same label name." });
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
							message: `Invalid collection id.`,
						});
					}
					const projectCommands = await isProjectCommandExist(body?.projectCommands, ProjectCommands);
					if (!projectCommands.success) {
						return res.status(400).json({
							...projectCommands,
							message: "Invalid project command uuid",
						});
					}
					const query = { _id };
					const collection = await Collections.findOne(query);
					if (!collection) {
						return res.status(400).json({
							success: false,
							message: `Cannot find collection with the id: ${_id}.`,
						});
					}
					const { error } = validate(body, true);
					if (error) return res.status(400).json({ success: false, error: error.details[0].message });
					const data = await Collections.findOneAndUpdate(query, body, { new: true, strict: false });
					return res.status(200).json({
						success: true,
						message: `Collection has been updated successfully!`,
						data,
					});
				} catch (error) {
					if (error.code === 11000) {
						return res.status(500).json({
							success: false,
							message: "Record already exist with same data",
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
							message: `Invalid collection id: ${_id}.`,
						});
					}
					const collection = await Collections.findOne(query);
					if (!collection) {
						return res.status(400).json({
							success: false,
							message: `Cannot find collection with the id: ${_id}.`,
						});
					}
					await Collections.findByIdAndRemove(query);
					return res.status(200).json({
						success: true,
						message: `Collections deleted successfully!`,
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
					const validationResult = await Utility.validateIds({ req, res, model: Collections });
					if (!validationResult.success) {
						return res.status(400).json({ success: false, message: validationResult.message });
					}
					const result = await Collections.deleteMany({ _id: { $in: ids } });
					if (result.deletedCount === 0) {
						return res.status(404).json({ success: false, error: "No items data with the provided IDs." });
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
		label: Joi.string(),
		isDefault: Joi.boolean(),
		projectId: Joi.string().required(),
		projectCommands: Joi.array().required(),
	});
	const update = Joi.object({
		label: Joi.string(),
		isDefault: Joi.boolean(),
		projectId: Joi.string().required(),
		projectCommands: Joi.array().required(),
	});
	const schema = isUpdate ? update : add;
	return schema.validate(data, { stripUnknown: true });
};

const isProjectCommandExist = async function (commands, ProjectCommands) {
	const invalidCommands = [];
	for (el of commands) {
		const item = await ProjectCommands.findOne({ uuid: el.uuid });
		if (!item) {
			invalidCommands.push(el.uuid);
		}
	}
	if (invalidCommands.length > 0) {
		return {
			success: false,
			invalidCommandUUID: invalidCommands,
		};
	}
	return {
		success: true,
		invalidCommandUUID: invalidCommands,
	};
};
