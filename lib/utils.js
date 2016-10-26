var vm = require('vm')

/**
 * k1='v1' k2="v2" => {k1: "v1", k2: "v2"}
 * @param {String} text
 * @return {Object}
 */
exports.getAttrs = function (text) {
	var attrs = {}
	// bug: k1=' v1=="foo" '
	var reAttr = /(\w+)=(['"])(.+)\2/g
	var m
	while (m = reAttr.exec(text)) {
		attrs[m[1]] = m[3]
	}
	return attrs
}

/**
 * @param {String} exp
 * @param {Object} data
 * @return {*} exp's value when run at the context of data
 */
exports.evalExp = function (exp, data) {
	if (data && exp in data) {
		return data[exp]
	} else {
		try {
			return vm.runInContext(exp, vm.createContext(data))
		} catch (e) {
			console.error('eval expression faild: [%s] - %s', exp, e.message)
		}
	}
}