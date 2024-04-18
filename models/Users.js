const Mongoose = require("mongoose");
const { Schema } = Mongoose;
const { projectSettingConnection } = require("utils/MongooseDBConnection");

const UsersSchema = new Schema(
	{
		name: { type: String, require: true, unique: true },
		email: { type: String, require: true, unique: true },
		password: { type: String, require: true },
		tempPassword: { type: String },
		role: { type: String, default: "user", require: true },
		isDisabled: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

module.exports = {
	schema: UsersSchema,
	UserModel: projectSettingConnection.model("users", UsersSchema),
};
