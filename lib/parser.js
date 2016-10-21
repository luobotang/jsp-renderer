function Parser(tokens) {
	this.tokens = tokens
}

Parser.prototype.run = function () {
	var ast = {
		type: 'document',
		children: []
	}

	this.tokens.forEach(function (token) {
		switch (token.type) {
			case 'text':
				ast.children.push(token)
				break
			case 'comment':
				ast.children.push(token)
				break
			case 'directive':
				ast.children.push(parseDirevtive(token))
				break
			case 'code':
				ast.children.push(token)
				break
			case 'code_exp':
				ast.children.push(token)
				break
			case 'tag':
				ast.children.push(token)
				break
			default:
				throw new Error('not supported token: ' + token.type)
		}
	})

	return ast
}

/* <%@ %> */
function parseDirevtive(token) {
	if (token.data.startsWith('include')) {
		return {
			type: 'directive_include',
			token: token,
			attrs: getAttrs(token.data)
		}
	} else {
		return token
	}
}

function getAttrs(text) {
	var attrs = {}
	text.split(/\s+/).forEach(function (attr) {
		var i = attr.indexOf('=')
		if (i > 0) {
			attrs[attr.slice(0, i)] = attr.slice(i + 1).replace(/^["']|["']$/g, '')
		} else {
			attrs[attr] = true
		}
	})
	return attrs
}

module.exports = Parser