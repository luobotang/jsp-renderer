# jsp-renderer

Render JSP to HTML, simply remove Java code block and other things not supported, but support some necessary things like ```<%@include%>```, ```<%=..%>```, ```${..}```, ```<c:if>```, etc.

## Usage

Run:

```hash
npm test
```

Then open your browser to ```http://localhost:8080/page/test.jsp```.

## API

## middleware(options)

Return express middleware.

Options:
- jspRoot {String} root directory of JSP files
- dataRoot {String} root directory of mock data