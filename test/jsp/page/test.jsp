<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<%@ include file="/lib/head.jsp" %>
<div id="container">
	<h1>Hello, world!</h1>
	<p>I'm ${name}.</p>
	<s:if test="ok">
		<p>Everything is OK!</p>
	</s:if>
	<s:else>
		<p>Something is WRONG!</p>
	</s:else>
</div>
<%@ include file="/lib/foot.jsp" %>