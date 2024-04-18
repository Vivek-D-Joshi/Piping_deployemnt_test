const Mongoose = require("mongoose");
const { gridSettings, colors, primaryUnitTypes } = require("config/constants");
const { Schema } = Mongoose;
const { projectSettingConnection } = require("utils/MongooseDBConnection");

const types = Object.keys(gridSettings);

const ProjectsModelSchema = new Schema(
	{
		userId: { type: Schema.ObjectId, require: true, ref: "users" },
		id: { type: Schema.Types.ObjectId, required: true },
		name: { type: String, require: true },
		projectReference: { type: String, require: true },
		uuid: { type: String },
		anchorPosition: { type: Array },
		settings: {
			snapSettings: {
				enabled: { type: Boolean, default: true },
			},
			gridSettings: {
				enabled: { type: Boolean, default: true },
				type: { type: String, enum: types, default: gridSettings.line },
				spacing: { type: Number, default: 1 },
				color: { type: String, default: colors.black },
			},
			anchorSettings: {
				enabled: { type: Boolean, default: true },
				showAnchor: { type: Number, default: true },
				color: { type: String, default: colors.azure },
			},
			imageSettings: {
				enabled: { type: Boolean, default: true },
				showImage: { type: Boolean, default: true },
				transparency: { type: Number, min: 1, max: 100, default: 1 },
				lock: { type: Boolean, default: false },
			},
			orthogonalSettings: {
				enabled: { type: Boolean, default: true },
				angles: { type: Array },
			},
		},
		floorList: { type: Array },
		pipingSetup: { type: Array },
		primaryUnits: {
			type: { type: String, default: primaryUnitTypes.imperial },
			uom: { type: String, default: "ft" },
		},
		version: { type: Number, default: 1 },
		deletedDate: { type: String },
		isDeleted: { type: Boolean, default: false },
		isDisabled: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

module.exports = {
	schema: ProjectsModelSchema,
	ProjectsModel: projectSettingConnection.model("projects", ProjectsModelSchema),
};
