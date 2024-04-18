const mongoose = require("mongoose");
const { logger } = require("utils");

module.exports = {
	setupDB: async () => {
		try {
			mongoose
				.connect(process.env.PIPING_MONGO_URI)
				.then(() => logger.info(`MongoDB Connected`))
				.catch((err) => logger.error({ err }));
		} catch (error) {
			return null;
		}
	},
	commonMastersConnection: mongoose.createConnection(process.env.COMMON_MASTERS_MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}),
	projectSettingConnection: mongoose.createConnection(process.env.COMMON_PROJECT_SETTING_MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}),
};
