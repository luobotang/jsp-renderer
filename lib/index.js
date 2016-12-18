var fs = require('fs')
var path = require('path')
var render = require('./render')
var loadData = require('./utils').loadData

exports.middleware = function (options) {
	options = options || {}
	var jspRoot = options.jspRoot = options.jspRoot || ''
	var dataRoot = options.dataRoot = options.dataRoot || ''
	var globalData = loadData(path.join(dataRoot, 'global-data'))

	return function (req, res, next) {
		if (req.path.endsWith('.jsp')) {
			console.log('request: ' + req.path)
			var pageData = loadData(path.join(dataRoot, req.path.replace('.jsp', '')))
			var html = render({
				root: jspRoot,
				file: path.join(jspRoot, req.path),
				data: Object.assign({}, globalData, pageData)
			})
			res.send(html)
		} else {
			next()
		}
	}
}