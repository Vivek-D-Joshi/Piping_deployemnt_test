const Mongoose = require("mongoose");
const { Schema } = Mongoose;
const { commonMastersConnection } = require("utils/MongooseDBConnection");

const schema = new Schema(
	{
		mainCategory: { type: String, required: true },
		masterCategory: { type: String, required: true },
		subCategory: { type: String, required: true },
		isDisabled: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

schema.index({ mainCategory: 1, masterCategory: 1, subCategory: 1 }, { unique: true });

module.exports = {
	schema: schema,
	ProductTypesModal: commonMastersConnection.model("product_types", schema),
};
