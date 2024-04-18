/**
 * Collection Controller
 * all collection endpoints accessible to all will be here
 */
const Joi = require("joi");
const { labelFields } = require("../config/constants");
const { hasTextLength } = require("utils/condition");

module.exports.globalMiddlewares = ["VerifyToken"];
module.exports.routes = function (props) {
	const {
		Services: { Labels, Projects, ProjectCommands, Pagination, Utility },
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
							message: `Invalid label id`,
						});
					}
					const data = await Labels.findOne(query);
					if (!data) {
						return res.status(400).json({
							success: false,
							message: `Cannot find label with the id: ${_id}.`,
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
					const data = await Pagination({ req, model: Labels, searchKeys, query });
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
					const isFieldValid = isLabelFieldsValid(body?.lines, body?.label, body?.projectId);
					if (!isFieldValid.success) {
						return res.status(400).json({
							...isFieldValid,
							message: `Invalid field value exist`,
						});
					}
					const label = await Labels.create(body);
					const data = await label.save();
					return res.status(200).json({
						success: true,
						message: `label has been added successfully!`,
						data,
					});
				} catch (error) {
					if (error.code === 11000) {
						return res.status(400).json({ success: false, message: "label already exist with same name." });
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
							message: `Invalid label id.`,
						});
					}
					const query = { _id };
					const collection = await Labels.findOne(query);
					if (!collection) {
						return res.status(400).json({
							success: false,
							message: `Cannot find label with the id: ${_id}.`,
						});
					}
					const { error } = validate(body, true);
					if (error) return res.status(400).json({ success: false, error: error.details[0].message });
					const isFieldValid = isLabelFieldsValid(body?.lines);
					if (!isFieldValid.success) {
						return res.status(400).json({
							...isFieldValid,
							message: `Invalid field value exist`,
						});
					}
					const data = await Labels.findOneAndUpdate(query, body, { new: true, strict: false });
					return res.status(200).json({
						success: true,
						message: `Label has been updated successfully!`,
						data,
					});
				} catch (error) {
					if (error.code === 11000) {
						return res.status(400).json({
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
					const label = await Labels.findOne(query);
					if (!label) {
						return res.status(400).json({
							success: false,
							message: `Cannot find collection with the id: ${_id}.`,
						});
					}
					await ProjectCommands.findOneAndUpdate(
						{ "props.labelId": _id },
						{ $unset: { "props.labelId": 1 } }
					);
					await Labels.findByIdAndRemove(query);
					return res.status(200).json({
						success: true,
						message: `Label deleted successfully!`,
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

					const validationResult = await Utility.validateIds({ req, res, model: Labels });
					if (!validationResult.success) {
						return res.status(400).json({ success: false, message: validationResult.message });
					}
					await ProjectCommands.findAndModify(
						{ "props.labelId": { $in: ids } },
						{ $unset: { "props.labelId": 1 } }
					);
					const result = await Labels.deleteMany({ _id: { $in: ids } });
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
		fontSize: Joi.string(),
		projectId: Joi.string().required(),
		lines: Joi.array().items(
			Joi.object({
				prefix: Joi.string(),
				suffix: Joi.string(),
				field: Joi.string().required(),
			})
		),
	});
	const update = Joi.object({
		label: Joi.string(),
		fontSize: Joi.string(),
		projectId: Joi.string().required(),
		lines: Joi.array().items(
			Joi.object({
				prefix: Joi.string(),
				suffix: Joi.string(),
				field: Joi.string().required(),
			})
		),
	});
	const schema = isUpdate ? update : add;
	return schema.validate(data, { stripUnknown: true });
};

const isLabelFieldsValid = function (arr, label, projectId) {
	const invalidFields = [];
	arr.forEach((item) => {
		item = item?.field.trim();
		if (!labelFields.includes(item)) {
			invalidFields.push({ label, projectId, item });
		}
	});
	if (invalidFields.length > 0) {
		return {
			success: false,
			invalidFields: invalidFields,
		};
	}
	return {
		success: true,
		invalidFields: invalidFields,
	};
};
