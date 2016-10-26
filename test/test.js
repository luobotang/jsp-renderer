var path = require('path')
var express = require('express')
var jspRender = require('../')

var app = express()

app.use(jspRender.middleware({
	jspRoot: path.join(__dirname, 'jsp'),
	dataRoot: path.join(__dirname, 'data')
}))

app.use(express.static(path.join(__dirname, 'static')))

app.listen('8080')

console.log('started on 8080...')