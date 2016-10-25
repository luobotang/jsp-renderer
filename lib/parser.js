var utils = require('./utils')

function Parser(tokens) {
	this.tokens = tokens
}

Parser.prototype.run = function () {
	var docNode = {
		type: 'document',
		children: []
	}

	var branch = []
	var node = docNode

	this.tokens.forEach(function (token) {
		switch (token.type) {
			case 'text':
			case 'comment':
			case 'code':
			case 'code_exp':
				node.children.push({
					type: token.type,
					token: token
				})
				break
			case 'directive':
				node.children.push(parseDirevtive(token))
				break
			case 'tag':
				if (token.closed) {
					node.children.push({
						type: 'tag',
						token: token
					})
				} else {
					if (token.is_open) {
						var tagNode = {
							type: 'tag',
							token: token,
							children: []
						}
						branch.push(node)
						node.children.push(tagNode)
						node = tagNode
					} else if (token.is_close) {
						node = branch.pop()
					}
				}
				break
			default:
				throw new Error('not supported token: ' + token.type)
		}
	})

	return docNode
}

/* <%@ %> */
function parseDirevtive(token) {
	if (token.data.startsWith('include')) {
		return {
			type: 'directive_include',
			token: token,
			attrs: utils.getAttrs(token.data)
		}
	} else {
		return {
			type: 'directive',
			token: token
		}
	}
}

module.exports = Parser