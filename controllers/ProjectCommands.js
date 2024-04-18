/**`
 * Project Commands Controller
 * all ProjectCommand commands endpoints accessible to all will be here
 */

const Joi = require("joi");
const { find } = require("lodash");
const { isValidObjectId } = require("utils/condition");

module.exports.globalMiddlewares = ["VerifyToken"];
module.exports.routes = function (props) {
	const {
		Services: { ProjectCommands, Projects, Utility },
	} = props;
	const addRequest = async (params) => {
		try {
			const isProject = params?.type === "project";
			const { error } = validateProjectCommand(params, isProject ? "addTypeProject" : "addTypeChild");
			if (error) return { success: false, error: error.details[0].message };
			if (isProject) {
				const isExist = await ProjectCommands.findOne({ type: params?.type, uuid: params?.uuid });
				if (isExist) {
					return { success: false, error: "Command with type project already exist" };
				}
			}
			const projectCommand = await ProjectCommands.create(params);
			const data = await projectCommand.save();
			return {
				success: true,
				message: `Project commands has been added successfully!`,
				data,
			};
		} catch (error) {
			return { success: false, error };
		}
	};
	const updateRequest = async (params, body) => {
		try {
			const { error } = validateProjectCommand(params, "update");
			if (error) return { success: false, error: error.details[0].message };
			const _id = params._id;
			const id = params.id;
			const uuid = params.uuid;
			const query = {};
			const conditions = [];
			addConditionIfValid(conditions, _id);
			addConditionIfValid(conditions, id);
			addConditionIfValid(conditions, uuid);

			if (conditions.length > 0) {
				query.$or = conditions;
			}
			const projectCommand = await ProjectCommands.findOne(query);
			if (!projectCommand) {
				return { success: false, message: `Cannot find project commands` };
			}
			const data = await ProjectCommands.findOneAndUpdate(query, body, { new: true, strict: false });
			return {
				success: true,
				message: `Project commands has been updated successfully!`,
				data,
			};
		} catch (error) {
			return { success: false, error };
		}
	};
	const deleteRequest = async (params) => {
		try {
			const _id = params._id;
			const id = params.id;
			const uuid = params.uuid;
			const query = {};
			const conditions = [];
			addConditionIfValid(conditions, _id);
			addConditionIfValid(conditions, id);
			addConditionIfValid(conditions, uuid);

			if (conditions.length > 0) {
				query.$or = conditions;
			}
			const projectCommand = await ProjectCommands.findOne(query);
			if (!projectCommand) {
				return { success: false, message: `Cannot find project commands` };
			}
			await ProjectCommands.findByIdAndRemove({ _id: projectCommand?._id });
			return { success: true, message: `Project commands deleted successfully!` };
		} catch (error) {
			return { success: false, error };
		}
	};
	return {
		"GET /:id": {
			handler: async function (req, res) {
				try {
					const _id = req.params.id;
					const query = { $or: [{ projectId: _id }, { projectEditorId: _id }] };
					if (!Utility.isValidObjectId(_id)) {
						return res.status(400).json({
							message: `Cannot find any project with the id: ${_id}.`,
						});
					}
					const projectExist = await Projects.findOne({ _id });
					if (!projectExist) {
						return res.status(400).json({
							message: `Cannot find any project with the id: ${_id}.`,
						});
					}
					const data = await ProjectCommands.find(query);

					if (!data) {
						return res.status(400).json({
							message: `Cannot find project commands with the id: ${_id}.`,
						});
					}
					return res.status(200).json({ success: true, meta: { total: data?.length }, data });
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"POST /": {
			handler: async function (req, res) {
				try {
					const result = await addRequest(req.body);
					return res.status(200).json(result);
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"PUT /:id": {
			handler: async function (req, res) {
				try {
					const result = await updateRequest(req.params, req.body);
					return res.status(200).json(result);
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"DELETE /:id": {
			handler: async function (req, res) {
				try {
					const result = await deleteRequest({ _id: req.params.id });
					return res.status(200).json(result);
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"POST /bulkOperation": {
			handler: async function (req, res) {
				try {
					const commands = req.body?.commands ?? [];
					let data = [];

					for (const command of commands) {
						let result;
						if (command?.action === "ADD") result = await addRequest(command);
						if (command?.action === "UPDATE") {
							const params = { uuid: command?.uuid };
							delete command.uuid;
							result = await updateRequest(params, command);
						}
						if (command?.action === "DELETE") result = await deleteRequest(command);
						if (result?.success) data.push({ success: true });
						if (!result?.success) data.push(result);
					}

					let status, message;
					const error = await find(data, (item) => !item?.success);
					const success = await find(data, (item) => item?.success);
					if (!error && success) {
						message = "All operations have been completed successfully.";
						status = "success";
					}
					if (error && !success) {
						message = "All operations failed.";
						status = "failed";
					}
					if (error && success) {
						message = "Partially successful with some operations encountering issues.";
						status = "partially_failed";
					}
					return res.status(200).json({ success: error ? false : true, data, status, message });
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
	};
};

const validateProjectCommand = (data, type, options) => {
	const commonValidation = {
		uuid: Joi.string().allow(null),
		type: Joi.string(),
		parent: Joi.string().allow(null),
		projectId: Joi.string(),
		projectEditorId: Joi.string().allow(null),
		props: Joi.object().allow(null),
		isDeleted: Joi.boolean(),
	};

	const addTypeProject = Joi.object({
		...commonValidation,
		uuid: Joi.string().allow(null).required().messages({ "any.required": "uuid is a required field" }),
		type: Joi.string().required().messages({ "any.required": "type is a required field" }),
	});
	const addTypeChild = Joi.object({
		...commonValidation,
		type: Joi.string().required().messages({ "any.required": "type is a required field" }),
		parent: Joi.string().allow(null).required().messages({ "any.required": "parent is a required field" }),
		projectEditorId: Joi.string()
			.allow(null)
			.required()
			.messages({ "any.required": "projectEditorId is a required field" }),
	});
	const update = Joi.object(commonValidation);
	const validateTypes = { addTypeProject, addTypeChild, update };
	const schema = validateTypes[type];
	return schema.validate(data, { stripUnknown: true, ...options });
};

function addConditionIfValid(conditions, value) {
	if (value !== undefined && value !== null && value !== "") {
		if (isValidObjectId(value)) {
			conditions.push({ _id: value });
		}
		conditions.push({ uuid: value });
	}
}
