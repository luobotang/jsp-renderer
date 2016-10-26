var fs = require('fs')
var path = require('path')
var render = require('./render')

exports.middleware = function (options) {
	options = options || {}
	var jspRoot = options.jspRoot = options.jspRoot || ''
	var dataRoot = options.dataRoot = options.dataRoot || ''
	var globalData = getData(path.join(dataRoot, 'global-data'))

	return function (req, res, next) {
		if (req.path.endsWith('.jsp')) {
			console.log('request: ' + req.path)
			var pageData = getData(path.join(dataRoot, req.path.replace('.jsp', '')))
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

	function getData(path) {
		try {
			return require(path)
		} catch (e) {
			console.error('get data failed: ' + path)
			return {}
		}
	}
}