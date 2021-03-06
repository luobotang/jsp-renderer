var reCustomTagOpen = /^<([a-z]+:[a-z]+)\S?/i
var reCustomTagClose = /^<\/([a-z]+:[a-z]+)\S?/i

function Tokenizer(text) {
	this.text = text
}

Tokenizer.prototype.run = function () {
	var pos = 0
	var text = this.text
	var rest = text
	var i, i_2
	var tokens = []
	var start, end

	var in_tag = false
	var tag_name

	while (pos < text.length - 1) {
		// try to find ..>
		if (in_tag) {
			i = rest.indexOf('>')
			i_2 = rest.indexOf('<')
			if (i > -1) {
				if (i_2 === -1 || i < i_2) {
					saveTextToken(pos, pos + i + 1)
					in_tag = false
				}
			}
		}
		i = rest.indexOf('<')
		if (i === -1) {
			saveTextToken(pos, text.length - 1)
			break
		}
		// trim text befer '<'
		if (i > 0) {
			saveTextToken(pos, pos + i)
		}
		// close tag </..
		if (rest[1] === '/') {
			if (rest.match(reCustomTagClose)) {
				tag_name = reCustomTagClose.exec(rest)[1]
				i = rest.indexOf('>')
				console.assert(i !== -1, 'close custom tag not closed')
				saveTagToken(pos, pos + i + 1, {
					name: tag_name,
					is_close: true
				})
			} else {
				i = rest.indexOf('>')
				console.assert(i !== -1, 'close tag not closed')
				saveTextToken(pos, pos + i + 1)
			}
		}
		// open tag <..
		else {
			if (rest.substr(0, 4) === '<%--') {
				i = rest.indexOf('--%>')

				console.assert(!in_tag, 'comment can not in tag')
				console.assert(i !== -1, 'comment must have no close tag')

				saveCommentToken(pos, pos + i + 4)
			} else if (rest.substr(0, 3) === '<%@') {
				i = rest.indexOf('%>')
				console.assert(i !== -1, 'no close tag for directive')
				saveDirectiveToken(pos, pos + i + 2)
			} else if (rest.substr(0, 3) === '<%=') {
				i = rest.indexOf('%>')
				console.assert(i !== -1, 'no close tag for code_expresstion')
				saveCodeExpressionToken(pos, pos + i + 2)
			} else if (rest.substr(0, 2) === '<%') {
				i = rest.indexOf('%>')
				console.assert(i !== -1, 'no close tag for code')
				saveCodeToken(pos, pos + i + 2)
			} else if (rest.match(reCustomTagOpen)) {
				tag_name = reCustomTagOpen.exec(rest)[1]
				i = findTagEndPosition(rest)
				if (rest[i - 1] === '/') {
					saveTagToken(pos, pos + i + 2, {
						name: tag_name,
						is_open: true,
						closed: true
					})
				} else {
					saveTagToken(pos, pos + i + 1, {
						name: tag_name,
						is_open: true
					})
				}
			} else {
				updateInTagStatus()
			}
		}
	}

	return tokens

	function findTagEndPosition(text) {
		var start
		var end = 0

		var _c = 0
		// handle: <s:if test='x > 10'>
		do {
			start = end
			end = text.indexOf('>', start + 1)
			console.assert(end !== -1, 'tag not ended')
			console.assert(_c++ < 10, 'findTagEndPosition: too many times')
		} while (!isQuoteNumMatch(text.slice(0, end)))

		return end
	}

	function isQuoteNumMatch(text) {
		var single = 0
		var double = 0
		var i = 0
		var len = text.length
		var ch

		console.assert(len < 1000, 'isQuoteNumMatch: too many chars')

		while (i < len) {
			ch = text[i]
			if (ch === '"') {
				if (text[i - 1] !== '\\' || single + double === 0) {
					double++
				}
			} else if (ch === "'") {
				if (text[i - 1] !== '\\' || single + double === 0) {
					single++
				}
			}
			i++
			console.assert(single < 100 && double < 100, 'isQuoteNumMatch: run too many times')
		}
		return single % 2 === 0 && double % 2 === 0
	}

	function saveTextToken(start, end) {
		tokens.push({
			type: 'text',
			start: start,
			end: end,
			text: text.slice(start, end),
			in_tag: in_tag
		})
		pos = end
		rest = text.slice(end)
	}

	/* <%-- ... --%> */
	function saveCommentToken(start, end) {
		tokens.push({
			type: 'comment',
			start: start,
			end: end,
			text: text.slice(start, end),
			in_tag: in_tag
		})
		pos = end
		rest = text.slice(end)
	}

	/* <%@ ... %> */
	function saveDirectiveToken(start, end) {
		tokens.push({
			type: 'directive',
			start: start,
			end: end,
			text: text.slice(start, end),
			data: text.slice(start + 3, end - 2).trim(),
			in_tag: in_tag
		})
		pos = end
		rest = text.slice(end)
	}

	/* <%= ... %> */
	function saveCodeExpressionToken(start, end) {
		tokens.push({
			type: 'code_exp',
			start: start,
			end: end,
			text: text.slice(start, end),
			data: text.slice(start + 3, end - 2).trim(),
			in_tag: in_tag
		})
		pos = end
		rest = text.slice(end)
	}

	/* <% ... %> */
	function saveCodeToken(start, end) {
		tokens.push({
			type: 'code',
			start: start,
			end: end,
			text: text.slice(start, end),
			data: text.slice(start + 2, end - 2).trim(),
			in_tag: in_tag
		})
		pos = end
		rest = text.slice(end)
	}

	/* <c:if ...> */
	function saveTagToken(start, end, data) {
		var token = Object.assign({
			type: 'tag',
			start: start,
			end: end,
			text: text.slice(start, end),
			in_tag: in_tag
		}, data)
		tokens.push(token)
		pos = end
		rest = text.slice(end)
	}

	/* in open tag, waiting for close */
	function updateInTagStatus() {
		var pos_start = rest.indexOf('<', 1)
		var pos_end = rest.indexOf('>', 1)

		if (pos_end === -1) {
			throw new Error('no close tag for tag')
		}

		// like: <img src="...?<%= ...%>" alt="...">
		if (pos_start > 0 && pos_start < pos_end) {
			in_tag = true
			saveTextToken(pos, pos + pos_start)
		} else {
			saveTextToken(pos, pos + pos_end + 1)
			in_tag = false
		}
	}
}

module.exports = Tokenizer