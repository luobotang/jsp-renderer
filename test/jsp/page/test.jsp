<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="s" uri="/struts-tags" %>
<%@ include file="/lib/head.jsp" %>
<div id="container">
	<s:if test="ok">
		<p class="tip-success">Action success!</p>
	</s:if>
	<s:else>
		<p class="tip-fail">${errorMessage}</p>
	</s:else>
	<form action="${form.action}" method="post">
		<p>
			User Name:<br>
			<input id="userName" type="text" placeholder="user name" value="${form.userName}">
		</p>
		<p>
			User Email:<br>
			<input id="userEmail" type="text" placeholder="user email" value="${form.userEmail}">
		</p>
		<p>
			<button type="submit">Save</button>
		</p>
	</form>
</div>
<%@ include file="/lib/foot.jsp" %>