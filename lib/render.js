var fs = require('fs')
var path = require('path')
var Tokenizer = require('./tokenizer')
var Parser = require('./parser')
var TagHandlers = require('./tag-handlers')

module.exports = render

function render(options) {
	var jspText = fs.readFileSync(options.file, {encoding: 'UTF-8'})
	// remove BOM
	if (jspText[0] === '\uFEFF') {
		jspText = jspText.slice(1)
	}
	var tokenizer = new Tokenizer(jspText)
	var tokens = tokenizer.run()
	var parser = new Parser(tokens)
	var ast = parser.run()
	console.assert(
		ast && ast.children && ast.children.length > 0,
		'AST error'
	)
	return renderEl(
		ast.children.map(function (node, i) {
			console.assert(node && node.type, 'node error')
			return renderNode(node, i, options)
		})
		.join(''),
		options.data
	)
}

function renderEl(html, data) {
	return html.replace(/\${([^}]*)}/g, function (_, exp) {
		var value = evalExp(exp.trim(), data)
		return value !== undefined ? value : ''
	})
}

function renderNode(node, index, options) {
	if (node.type === 'text') {
		return node.token.text
	} else if (node.type === 'directive') {
		return ''
	} else if (node.type === 'directive_include') {
		return include(node.attrs.file, options)
	} else if (node.type === 'code') {
		return renderCodeNode(node, index, options)
	} else if (node.type === 'code_exp') {
		return renderCodeExp(node, index, options)
	} else if (node.type === 'tag') {
		return renderCustomTagNode(node, index, options)
	} else {
		return '<!-- removed: ' + node.type + ' -->'
	}
}

function include(file, options) {
	var filePath
	if (path.isAbsolute(file)) {
		filePath = path.join(options.root, file)
	} else {
		filePath = path.join(options.file, file)
	}

	var jspText
	try {
		jspText = fs.readFileSync(filePath, {encoding: 'UTF-8'})
	} catch (e) {
		return '<!-- can not include: ' + filePath + ' -->'
	}

	return (
		'<!-- include: ' + file + ' start -->\n' +
		render(Object.assign({}, options, {file: filePath})) + '\n' +
		'<!-- include: ' + file + ' end -->'
	)
}

function renderCodeNode(node) {
	if (node.token.in_tag) {
		return '' // like <img src="<% if (..) { %>...<% } %>">
	} else {
		var code = node.token.data
		// multi line
		if (code.indexOf('\n') > -1) {
			return (
				'<!-- removed code:\n' +
				code + '\n' +
				'-->'
			)
		} else {
			return '<!-- removed code: ' + code + ' -->'
		}
	}
}

function renderCodeExp(node, index, options) {
	var exp = node.token.data
	var value = evalExp(exp, options.data)
	return value !== undefined ? value :
		node.token.in_tag ? '' : '<!-- removed code_exp: ' + exp + ' --->'
}

function renderCustomTagNode(node, index, options) {
	var handler = TagHandlers[node.token.name] || TagHandlers['default']
	return handler(node, index, options, renderNode)
}

function evalExp(exp, data) {
	if (data && exp in data) {
		return data[exp]
	}
}