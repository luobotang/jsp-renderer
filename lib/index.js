var fs = require('fs')
var path = require('path')
var Tokenizer = require('./tokenizer')
var Parser = require('./parser')

exports.render = render

function render(jspText, options) {
	var tokenizer = new Tokenizer(jspText)
	var tokens = tokenizer.run()
	var parser = new Parser(tokens)
	var ast = parser.run()
	return renderAst(ast, options)
}

function renderAst(ast, options) {
	return ast.children.map(function (node) {
		if (node.type === 'text') {
			return node.text
		} else if (node.type === 'directive') {
			return ''
		} else if (node.type === 'directive_include') {
			return include(node.attrs.file, options)
		} else if (node.type === 'code') {
			return '<!-- removed code: ' + node.data + ' -->'
		} else if (node.type === 'code_exp') {
			return ''
		} else if (node.type === 'tag') {
			return '<!-- removed tag: ' + node.name + ' -->'
		} else {
			return '<!-- removed: ' + node.type + ' -->'
		}
	}).join('')
}

function include(file, options) {
	var rootPath = options && options.root || ''
	var filePath = path.join(rootPath, file)

	var jspText
	try {
		jspText = fs.readFileSync(filePath, {encoding: 'UTF-8'})
	} catch (e) {
		return '<!-- can not include: ' + filePath + ' -->'
	}

	return render(jspText, options)
}