/**
 * DrawingSummary Summary Controller
 * all drawing summary endpoints accessible to all will be here
 */
const Joi = require("joi");
const path = require("path");
const uuid = require("uuid");
const fs = require("fs");
const { hasTextLength } = require("utils/condition");

module.exports.globalMiddlewares = ["VerifyToken"];
module.exports.routes = function (props) {
	const {
		Services: { DrawingSummary, Projects, Pagination, Utility, AWSHelpers },
		config: { rootDir },
	} = props;
	return {
		"GET /:projectId": {
			localMiddlewares: ["IsUserProject"],
			handler: async function (req, res) {
				try {
					const projectId = req.params.projectId;
					const query = { projectId };
					const data = await DrawingSummary.findOne(query);
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
					const searchKeys = ["paperSize.label", "titleBlock.createdBy", "titleBlock.companyName"];
					const data = await Pagination({ req, model: DrawingSummary, searchKeys, query });
					return res.status(200).json(data);
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"POST /": {
			localMiddlewares: ["FileUpload", "IsUserProject"],
			handler: async function (req, res) {
				try {
					const [logoFile] = req.files;
					const body = Utility.parseJSONStrings(req.body);
					const { error } = validate(body, false);
					if (error)
						return res.status(400).json({ success: false, error: error.details.map((err) => err.message) });

					const query = {
						projectId: body.projectId,
					};
					if (body.logo) {
						const isValidLogoUrl = await AWSHelpers.isS3Url(body.logo);
						if (!isValidLogoUrl) {
							return res.status(200).json({
								success: false,
								message: `Invalid logo uri`,
							});
						}
					}
					const record = await DrawingSummary.findOne(query);
					if (record) {
						const logoUrl = await getFileUrl(req.files, AWSHelpers);
						if (logoUrl) {
							body.logo = logoUrl;
						}
						if (body.logo !== undefined && record.logo && logoFile) {
							await AWSHelpers.deleteS3Object(record.logo);
						}
						const data = await DrawingSummary.findOneAndUpdate(query, body, { new: true, strict: false });
						return res.status(200).json({
							success: true,
							message: `Drawing summary has been updated successfully!`,
							data,
						});
					}
					body.logo = req.files.length > 0 ? await getFileUrl(req.files, AWSHelpers) : body.logo;
					const drawing = await DrawingSummary.create(body);
					const data = await drawing.save();
					return res.status(200).json({
						success: true,
						message: `Drawing summary has been added successfully!`,
						data,
					});
				} catch (error) {
					if (error.code === 11000) {
						return res
							.status(400)
							.json({ success: false, message: "Drawing summary already exist for a project." });
					}
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
	};
};

const validate = (data, isUpdate = false) => {
	const add = Joi.object({
		paperSize: Joi.object({
			label: Joi.string().required(),
			unit: Joi.string().valid("mm", "inches").required(),
			xDim: Joi.number().required(),
			yDim: Joi.number().required(),
		}),
		titleBlock: Joi.object({
			createdBy: Joi.string().allow(""),
			companyName: Joi.string().allow(""),
			companyPhone: Joi.string().allow(""),
			companyWebsite: Joi.string().allow(""),
			companyAddress: Joi.string().allow(""),
			date: Joi.date().allow(""),
		}),
		projectId: Joi.string().required(),
	});
	const schema = isUpdate ? update : add;
	return schema.validate(data, { stripUnknown: true, abortEarly: false });
};

const getFileUrl = async function (files, AWSHelpers) {
	[tempFile] = files;
	if (!tempFile) {
		return;
	}
	const imageRegex = /^image\/(jpeg|png)$/;
	if (!imageRegex.test(tempFile.mimetype)) {
		throw new Error("Invalid file provided only jpeg and png files are allowed.");
	}
	importedUrl = await AWSHelpers.uploadToS3AndGetUrl(tempFile.path, tempFile.originalname, "drawingSummary/logo");
	fs.unlinkSync(tempFile.path);
	return importedUrl;
};
