var reCustomTag = /^<([a-z]+:[a-z]+)\S?/i

function Tokenizer(text) {
	this.text = text
	this.state = 'text'
	this.states = []
}

Tokenizer.prototype.run = function () {
	var pos = 0
	var text = this.text
	var rest = text
	var i
	var tokens = []
	var start, end

	while (pos < text.length - 1) {
		i = rest.indexOf('<')
		if (i === -1) {
			saveTextToken(pos, text.length - 1)
			break
		} else {
			if (i > 0) {
				saveTextToken(pos, pos + i)
			}
			if (rest.substr(0, 4) === '<%--') {
				i = rest.indexOf('--%>')
				if (i === -1) {
					throw new Error('no close tag for comment')
				}
				saveCommentToken(pos, pos + i + 4)
			} else if (rest.substr(0, 3) === '<%@') {
				i = rest.indexOf('%>')
				if (i === -1) {
					throw new Error('no close tag for directive')
				}
				saveDirectiveToken(pos, pos + i + 2)
			} else if (rest.substr(0, 3) === '<%=') {
				i = rest.indexOf('%>')
				if (i === -1) {
					throw new Error('no close tag for code_expresstion')
				}
				saveCodeExpressionToken(pos, pos + i + 2)
			} else if (rest.substr(0, 2) === '<%') {
				i = rest.indexOf('%>')
				if (i === -1) {
					throw new Error('no close tag for code')
				}
				saveCodeToken(pos, pos + i + 2)
			} else {
				if (rest.match(reCustomTag)) {
					i = rest.indexOf('>')
					if (i === -1) {
						throw new Error('no close tag for custom tag')
					}
					// <x:x />
					if (rest[i - 1] === '/') {
						saveTagToken(pos, pos + i + 1)
					} else {
						// <x:x> ... </x:x>
						var _tag_name = reCustomTag.exec(rest)[1]
						i = rest.indexOf('</' + _tag_name + '>')
						if (i === -1) {
							throw new Error('no close tag for custom tag: ' + _tag_name)
						}
						saveTagToken(pos, pos + i + _tag_name.length + 3)
					}
				} else {
					i = rest.indexOf('>')
					if (i === -1) {
						throw new Error('no close tag for tag')
					}

					// like: <img src="...?<%= ...%>" alt="...">
					var i_start = rest.indexOf('<', 1)
					if (i_start > 0 && i_start < i) {
						saveTextToken(pos, pos + i_start)
					} else {
						saveTextToken(pos, pos + i + 1)
					}
				}
			}
		}
	}

	return tokens

	function saveTextToken(start, end) {
		tokens.push({
			type: 'text',
			start: start,
			end: end,
			text: text.slice(start, end)
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
			text: text.slice(start, end)
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
			data: text.slice(start + 3, end - 2).trim()
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
			data: text.slice(start + 3, end - 2).trim()
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
			data: text.slice(start + 2, end - 2).trim()
		})
		pos = end
		rest = text.slice(end)
	}

	/* <c:if ...> */
	function saveTagToken(start, end) {
		var token = {
			type: 'tag',
			start: start,
			end: end,
			text: text.slice(start, end)
		}
		var m = reCustomTag.exec(token.text)
		token.name = m[1]
		tokens.push(token)
		pos = end
		rest = text.slice(end)
	}
}

module.exports = Tokenizer