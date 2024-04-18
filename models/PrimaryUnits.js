const Mongoose = require("mongoose");
const { primaryUnitTypes } = require("config/constants");
const { Schema } = Mongoose;
const types = Object.keys(primaryUnitTypes);
const { projectSettingConnection } = require("utils/MongooseDBConnection");

const PrimaryUnitsModelSchema = new Schema(
	{
		type: { type: String, enum: types, default: "imperial", require: true },
		fullName: { type: String, require: true },
		shorthand: { type: String, require: true },
		isDisabled: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

module.exports = {
	schema: PrimaryUnitsModelSchema,
	PrimaryUnitsModel: projectSettingConnection.model("primary_units", PrimaryUnitsModelSchema),
};
