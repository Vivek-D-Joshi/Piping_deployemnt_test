/**
 * Piping sizes Controller
 * all piping sizes endpoints accessible to all will be here
 */

const Joi = require("joi");

module.exports.globalMiddlewares = ["VerifyToken"];
module.exports.routes = function (props) {
	const {
		Services: { PipingSizes, PrimaryUnits, Pagination, Utility },
	} = props;
	return {
		"GET /:id": {
			handler: async function (req, res) {
				try {
					const _id = req.params.id;
					const query = { _id };
					if (!Utility.isValidObjectId(_id)) {
						return res.status(400).json({
							message: `Cannot find piping size with the id: ${_id}.`,
						});
					}
					const data = await PipingSizes.findOne(query);
					if (!data) {
						return res.status(400).json({
							message: `Cannot find piping size with the id: ${_id}.`,
						});
					}
					const unitData = data?.unitData;
					delete data.unitId;
					return res.status(200).json({ success: true, data: { ...data, unitData } });
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"GET /": {
			handler: async function (req, res) {
				try {
					const searchKeys = ["size", "type", "fullName", "shorthand"];
					const data = await Pagination({ req, model: PipingSizes, searchKeys });
					return res.status(200).json(data);
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"POST /": {
			localMiddlewares: ["IsAdmin"],
			handler: async function (req, res) {
				try {
					const body = req.body;
					const unitId = body?.unitId;
					if (!unitId) {
						return res.status(400).json({
							message: `Please provide unitId`,
						});
					}
					if (!Utility.isValidObjectId(unitId)) {
						return res.status(400).json({
							message: `Invalid unitId.`,
						});
					}
					const unit = await PrimaryUnits.findOne({ _id: unitId });
					if (!unit)
						return res.status(401).json({ success: false, message: "Unit with this unit id not found" });

					const { error } = validatePipingSize(body, false);
					if (error) return res.status(400).json({ success: false, error: error.details[0].message });
					const pipingSize = await PipingSizes.create(body);
					const { _id } = await pipingSize.save();
					const query = { _id };
					const data = await PipingSizes.findOne(query);
					let pipingSizeItem = data.toObject();
					const unitData = pipingSizeItem?.unitId;
					delete pipingSizeItem.unitId;
					return res.status(200).json({
						success: true,
						message: `Piping size has been added successfully!`,
						data: { ...pipingSizeItem, unitData },
					});
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"PUT /:id": {
			localMiddlewares: ["IsAdmin"],
			handler: async function (req, res) {
				try {
					const body = req.body;
					const unitId = body?.unitId;
					if (unitId && !Utility.isValidObjectId(unitId)) {
						return res.status(400).json({
							message: `Invalid unitId.`,
						});
					}
					const { error } = validatePipingSize(body, true);
					if (error) return res.status(400).json({ success: false, error: error.details[0].message });
					const _id = req.params.id;
					if (!Utility.isValidObjectId(_id)) {
						return res.status(400).json({
							message: `Cannot find piping size with the id: ${_id}.`,
						});
					}
					const query = { _id };
					const pipingSize = await PipingSizes.findOne(query);
					if (!pipingSize) {
						return res.status(400).json({
							message: `Cannot find piping size with the id: ${_id}.`,
						});
					}
					await PipingSizes.findOneAndUpdate(query, body, { new: true, strict: false });
					const data = await PipingSizes.findOne(query);
					let pipingSizeItem = data.toObject();
					const unitData = pipingSizeItem?.unitId;
					delete pipingSizeItem.unitId;
					return res.status(200).json({
						success: true,
						message: `Piping size has been updated successfully!`,
						data: { ...pipingSizeItem, unitData },
					});
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"DELETE /:id": {
			localMiddlewares: ["IsAdmin"],
			handler: async function (req, res) {
				try {
					const _id = req.params.id;
					const query = { _id };
					if (!Utility.isValidObjectId(_id)) {
						return res.status(400).json({
							message: `Cannot find piping size with the id: ${_id}.`,
						});
					}
					const pipingSize = await PipingSizes.findOne(query);
					if (!pipingSize) {
						return res.status(400).json({
							message: `Cannot find piping size with the id: ${_id}.`,
						});
					}
					await PipingSizes.findByIdAndRemove(query);
					return res.status(200).json({
						success: true,
						message: `Piping size deleted successfully!`,
					});
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
	};
};

const validatePipingSize = (data, isUpdate = false) => {
	const addPipingSizeSchema = Joi.object({
		size: Joi.string().required(),
		displaySize: Joi.string(),
		outerDiameter: Joi.string(),
		type: Joi.string().required(),
		unitId: Joi.string().required(),
		isDisabled: Joi.boolean(),
	});
	const updatePipingSizeSchema = Joi.object({
		size: Joi.string(),
		displaySize: Joi.string(),
		outerDiameter: Joi.string(),
		type: Joi.string(),
		unitId: Joi.string(),
		isDisabled: Joi.boolean(),
	});
	const schema = isUpdate ? updatePipingSizeSchema : addPipingSizeSchema;
	return schema.validate(data, { stripUnknown: true });
};
