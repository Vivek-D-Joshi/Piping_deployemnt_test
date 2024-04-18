const { hasTextLength, hasValue, hasObjectLength } = require("utils/condition");

module.exports = function ({ Services }) {
	return (handler = async (props) => {
		const { req, model, searchKeys = [], query: queries = {} } = props;
		const { page = 1, limit: queryLimit, sort: sortQuery = props?.defaultSort, asc = 1, search = "" } = req.query;
		const limit = hasTextLength(queryLimit) ? queryLimit : 99999;
		const sort = hasObjectLength(sortQuery) ? sortQuery : {};
		const searchQueries = searchKeys.map((item) => ({ [item]: new RegExp(search, "i") }));
		const filterParams = hasTextLength(req?.query?.filter) ? req?.query?.filter : "{}";
		const filter = JSON?.parse?.(filterParams);
		const query = { $and: [{ $or: searchQueries }, queries, filter] };
		const skip = limit * page - limit;
		const sortBy = Services.Utility.hasObjectLength(sort) ? sort : { [sort]: asc };
		const totalItems = await model.count(query);
		const data = await model.paginationFind(query, sortBy, skip, +limit);
		const meta = { limit, totalPages: Math.ceil(totalItems / limit), currentPage: page, totalItems };
		return { meta, data };
	});
};
