/**
 * Piping systems Controller
 * all piping systems endpoints accessible to all will be here
 */

const Joi = require("joi");

// module.exports.globalMiddlewares = ["VerifyToken"];
module.exports.routes = function (props) {
	const {
		Services: { PipingSystems, Projects, Pagination, Utility },
	} = props;
	return {
		"GET /:id": {
			handler: async function (req, res) {
				try {
					const _id = req.params.id;
					const query = { _id };
					if (!Utility.isValidObjectId(_id)) {
						return res.status(400).json({
							message: `Cannot find piping system with the id: ${_id}.`,
						});
					}
					const data = await PipingSystems.findOne(query);
					if (!data) {
						return res.status(400).json({
							message: `Cannot find piping system with the id: ${_id}.`,
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
					const searchKeys = ["name", "initials", "color"];
					const data = await Pagination({ req, model: PipingSystems, searchKeys });
					return res.status(200).json(data);
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"POST /": {
			handler: async function (req, res) {
				try {
					const body = req.body;
					const { error } = validate(body, false);
					if (error) return res.status(400).json({ success: false, error: error.details[0].message });
					const projectId = body?.projectId;
					if (!Utility.isValidObjectId(projectId)) {
						return res.status(400).json({
							message: `Cannot find project with the id: ${projectId}.`,
						});
					}
					const project = await Projects.findOne({ _id: projectId });
					if (!project) {
						return res.status(400).json({
							message: `Cannot find project with the id: ${_id}.`,
						});
					}

					const pipingSystem = await PipingSystems.create(body);
					const data = await pipingSystem.save();
					return res.status(200).json({
						success: true,
						message: `Piping system has been added successfully!`,
						data,
					});
				} catch (error) {
					if (error.code === 11000) {
						return res
							.status(400)
							.json({ success: false, message: "Piping system already exist with same data." });
					}
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"PUT /:id": {
			handler: async function (req, res) {
				try {
					const body = req.body;

					const _id = req.params.id;
					if (!Utility.isValidObjectId(_id)) {
						return res.status(400).json({
							message: `Cannot find piping system with the id: ${_id}.`,
						});
					}
					const query = { _id };
					const pipingSystem = await PipingSystems.findOne(query);
					if (!pipingSystem) {
						return res.status(400).json({
							message: `Cannot find piping system with the id: ${_id}.`,
						});
					}
					const { error } = validate(body, true);
					if (error) return res.status(400).json({ success: false, error: error.details[0].message });
					const data = await PipingSystems.findOneAndUpdate(query, body, { new: true, strict: false });
					return res.status(200).json({
						success: true,
						message: `Piping system has been updated successfully!`,
						data,
					});
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"DELETE /:id": {
			handler: async function (req, res) {
				try {
					const _id = req.params.id;
					const query = { _id };
					if (!Utility.isValidObjectId(_id)) {
						return res.status(400).json({
							message: `Cannot find piping system with the id: ${_id}.`,
						});
					}
					const pipingSystem = await PipingSystems.findOne(query);
					if (!pipingSystem) {
						return res.status(400).json({
							message: `Cannot find piping system with the id: ${_id}.`,
						});
					}
					await PipingSystems.findByIdAndRemove(query);
					return res.status(200).json({
						success: true,
						message: `Piping system deleted successfully!`,
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
					if (!ids || !Array.isArray(ids) || ids.length === 0) {
						return res.status(400).json({ error: "Invalid or empty IDs provided." });
					}
					for (const id of ids) {
						if (!Utility.isValidObjectId(id)) {
							return res.status(400).json({
								message: `Cannot find data with the id: ${id}.`,
							});
						}
					}
					const result = await PipingSystems.deleteMany({ _id: { $in: ids } });
					if (result.deletedCount === 0) {
						return res.status(404).json({ error: "No items data with the provided IDs." });
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
		name: Joi.string().required(),
		initials: Joi.string().required(),
		color: Joi.string(),
		pipeTypes: Joi.object(),
		pipingNetwork: Joi.object(),
		genericPipeSystemName: Joi.object(),
		genericPipeSizes: Joi.array(),
		isDisabled: Joi.boolean(),
	});
	const update = Joi.object({
		name: Joi.string(),
		initials: Joi.string(),
		color: Joi.string(),
		pipeTypes: Joi.object(),
		pipingNetwork: Joi.object(),
		genericPipeSystem: Joi.object(),
		genericPipeSizes: Joi.array(),
		isDisabled: Joi.boolean(),
	});
	const schema = isUpdate ? update : add;
	return schema.validate(data, { stripUnknown: true });
};
