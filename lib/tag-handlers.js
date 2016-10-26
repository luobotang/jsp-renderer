var utils = require('./utils')

var last_s_if_mathed

module.exports = {
	'c:forEach': function (node, index, options, renderNode) {
		return '<!-- c:forEach (' + index + ') removed -->'
	},
	'c:if': tag_if_handler,
	's:if': tag_if_handler,
	's:else': function (node, index, options, renderNode) {
		if (!last_s_if_mathed) {
			return node.token.in_tag ?
			node.children.map(function (child, i) {
				return renderNode(child, index + '_' + i, options)
			}).join('') : (
				'<!-- s:else (' + index + ') start -->\n' +
				node.children.map(function (child, i) {
					return renderNode(child, index + '_' + i, options)
				}).join('') + '\n' +
				'<!-- s:else (' + index + ') end -->'
			)
		} else {
			return node.token.in_tag ? '' : '<!-- removed s:else (' + index + ') -->'
		}
	},
	'default': function (node, index, options, renderNode) {
		var token = node.token
		if (node.children && node.children.length > 0) {
			return token.in_tag ?
			node.children.map(function (child, i) {
				return renderNode(child, index + '_' + i, options)
			}).join('') : (
				'<!-- ' + token.name + ' (' + index + ') start -->\n' +
				node.children.map(function (child, i) {
					return renderNode(child, index + '_' + i, options)
				}).join('') + '\n' +
				'<!-- ' + token.name + ' (' + index + ') end -->'
			)
		} else {
			return token.in_tag ? '' : '<!-- removed tag: ' + token.name + ' -->'
		}
	}
}

function tag_if_handler(node, index, options, renderNode) {
	var token = node.token
	var attrText = token.text.slice(5, -1).trim()
	var attrs = utils.getAttrs(attrText)
	var testExp = attrs.test
	if (testExp && typeof testExp === 'string' && (testExp = testExp.trim())) {
		// handle el exp
		if (testExp.startsWith('${') && testExp.endsWith('}')) {
			testExp = testExp.slice(2, -1)
		}
		var match = utils.evalExp(testExp, options.data)
		if (match) {
			last_s_if_mathed = true
			return token.in_tag ?
			node.children.map(function (child, i) {
				return renderNode(child, index + '_' + i, options)
			}).join('') : (
				'<!-- s:if (' + index + ') start -->\n' +
				node.children.map(function (child, i) {
					return renderNode(child, index + '_' + i, options)
				}).join('') + '\n' +
				'<!-- s:if (' + index + ') end -->'
			)
		} else {
			last_s_if_mathed = false
			return token.in_tag ? '' : '<!-- removed s:if (' + index + ') -->'
		}
	} else {
		throw new Error('no test in s:if (' + index + ', ' + token.text + ')')
	}
}