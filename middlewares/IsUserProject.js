module.exports = async function (req, res, next, { Services }) {
	try {
		const userId = req.user.role === "admin" ? null : req.user?._id;
		const projectId = req.body?.projectId ?? (await checkForParams(req, res, Services));
		const query = {
			_id: projectId,
			userId: userId,
			isDeleted: false,
		};
		if (!Services.Utility.isValidObjectId(projectId)) {
			return res.status(400).json({
				success: false,
				message: req.body?.projectId ? `Invalid project id: ${projectId}.` : `Invalid id`,
			});
		}
		if (!userId) {
			delete query.userId;
		}
		const isUserProject = await Services.Projects.findOne(query);
		if (!isUserProject) {
			return res.status(400).json({
				success: false,
				message: `Cannot find project with the id: ${projectId} for User.`,
			});
		}
		next();
	} catch (error) {
		res.status(500).json({ error, message: error.message });
	}
};

const checkForParams = async function (req, res, Services) {
	const [idSelector] = Object.keys(req.params);
	const _id = req.params[idSelector];
	const query = idSelector !== "id" ? { [idSelector]: _id } : { _id };
	const model = req.baseUrl.substring(1);
	if (!Services.Utility.isValidObjectId(_id)) {
		return null;
	}
	const data = await Services[model].findOne(query);
	if (!data) {
		return null;
	}
	return data.projectId.toString() ?? _id;
};
