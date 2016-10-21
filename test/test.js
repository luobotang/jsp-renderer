var fs = require('fs')
var render = require('../lib').render

var jspText = fs.readFileSync(process.argv[2], {encoding: 'UTF-8'})
var html = render(jspText, {
	root: process.argv[3]
})


fs.writeFileSync(process.argv[4], html)