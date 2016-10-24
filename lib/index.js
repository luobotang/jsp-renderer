var fs = require('fs')
var path = require('path')
var render = require('./render')

exports.middleware = function (options) {
	options = options || {}
	var jspRoot = options.jspRoot = options.jspRoot || ''
	var dataRoot = options.dataRoot = options.dataRoot || ''

	return function (req, res, next) {
		if (req.path.endsWith('.jsp')) {
			var html = render({
				root: jspRoot,
				file: path.join(jspRoot, req.path),
				data: getData(path.join(dataRoot, req.path.replace('.jsp', '.json')))
			})
			res.send(html)
		} else {
			next()
		}
	}

	function getData(path) {
		try {
			var data = fs.readFileSync(path, {encoding: 'UTF-8'})
			return JSON.parse(data)
		} catch (e) {
			console.error('get data failed: ' + path)
			return null
		}
	}
}