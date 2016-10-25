var express = require('express')
var fs = require('fs')
var path = require('path')
var jspRender = require('../')

var app = express()

app.use(jspRender.middleware({
	jspRoot: 'test/jsp',
	dataRoot: 'test/data'
}))

app.use(express.static('test/static'))

app.listen('8080')

console.log('started on 8080...')