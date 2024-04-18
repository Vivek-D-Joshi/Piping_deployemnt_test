module.exports = function (Services) {
	return {
		/**
		 * Services.Respond.ok
		 * to respond with 200 OK HTTP status
		 */
		ok: (res, payload) => {
			res.status(200);
			res.json(payload);
		},

		/**
		 * Services.Respond.unAuthorized
		 * to respond when the token is unavailable or expired
		 */
		unAuthorized: (res, message) => {
			res.status(401);
			res.json({
				message: message || "Unauthorized Request, Please check the request.",
			});
		},

		/**
		 * Services.Respond.missingParams
		 * to respond when params for the request are missing
		 */
		missingParams: (res, params, message) => {
			res.status(400);
			res.json({
				missing: params,
				message: message || "Missing parameters.",
			});
		},

		/**
		 * Services.Respond.bad
		 * to respond when a bad request is occured
		 */
		bad: (res, message) => {
			res.status(400);
			res.json(typeof message === "string" ? { message } : message);
		},

		/**
		 * Services.Respond.serverError
		 * to respond when something unpredictable happens on the server
		 */
		serverError: (res, message) => {
			res.status(500);
			res.json({ message: message || "Internal Server Error." });
		},

		/**
		 * Services.Respond.paramsValidatorError
		 * to respond when error comes in from ParamsValidator
		 */
		paramsValidatorError: (res, queryParam, allowedParams) => {
			if (queryParam.errorFields) {
				Services.Respond.bad(res, Object.values(queryParam.errorFields).join("\n"));
			} else if (queryParam.missingFields) {
				Services.Respond.missingParams(
					res,
					queryParam.missingFields,
					`Only ${allowedParams.map((e) => e.key).join(",")} are allowed.`
				);
			}
		},
	};
};
