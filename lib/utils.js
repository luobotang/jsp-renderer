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