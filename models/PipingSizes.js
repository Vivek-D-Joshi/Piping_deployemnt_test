const Mongoose = require("mongoose");
const { primaryUnitTypes } = require("config/constants");
const { Schema } = Mongoose;

const types = Object.keys(primaryUnitTypes);

const PipingSizesModelSchema = new Schema(
	{
		size: { type: String, require: true },
		displaySize: { type: String },
		outerDiameter: { type: String },
		type: { type: String, enum: types, default: "imperial", require: true },
		unitId: { type: Schema.ObjectId, require: true, ref: "primary_units" },
		isDisabled: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

module.exports = {
	schema: PipingSizesModelSchema,
	PipingSizesModel: Mongoose.model("piping_sizes", PipingSizesModelSchema),
};
