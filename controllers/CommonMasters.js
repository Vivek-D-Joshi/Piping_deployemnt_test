/**
 * Common masters  Controller
 * all common masters  endpoints accessible to all will be here
 */

module.exports.routes = function (props) {
	const {
		Services: { CommonMasters },
	} = props;
	return {
		"GET /GenericPipeSystems": {
			handler: async function (req, res) {
				try {
					const data = await CommonMasters.findGenericPipeSystems();
					return res.status(200).json({ success: true, data });
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"GET /PipeNetworkTypes": {
			handler: async function (req, res) {
				try {
					const data = await CommonMasters.findPipeNetworkTypes();
					return res.status(200).json({ success: true, data });
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
		"GET /ProductTypes": {
			handler: async function (req, res) {
				try {
					const data = await CommonMasters.findProductTypes({ mainCategory: "Pipe" });
					return res.status(200).json({ success: true, data });
				} catch (error) {
					return res.status(500).json({ success: false, message: error.message });
				}
			},
		},
	};
};
