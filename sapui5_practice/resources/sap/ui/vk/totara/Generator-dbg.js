
sap.ui.define([
	"./Commands"
], function(Commands) {
	"use strict";

	var Generator = function() { };

	Generator.createSetStreamingTokenCommand = function(options) {
		var requestCommandContent = JSON.stringify(options);
		var command = Commands.setStreamingToken + ("[" + requestCommandContent.length + "]") + requestCommandContent;
		return command;
	};

	Generator.createGetTreeCommand = function(options) {
		var requestCommandContent = JSON.stringify(options);
		var command = Commands.getTree + ("[" + requestCommandContent.length + "]") + requestCommandContent;
		return command;
	};

	Generator.createGetViewCommand = function(options) {
		var requestCommandContent = JSON.stringify(options);
		var command = Commands.getView + ("[" + requestCommandContent.length + "]") + requestCommandContent;
		return command;
	};

	Generator.createGetViewGroupsCommand = function(options) {
		var requestCommandContent = JSON.stringify(options);
		var command = Commands.getViewGroups + ("[" + requestCommandContent.length + "]") + requestCommandContent;
		return command;
	};

	Generator.createGetDynamicViewCommand = function(options) {
		var requestCommandContent = JSON.stringify(options);
		var command = Commands.getDynamicView + ("[" + requestCommandContent.length + "]") + requestCommandContent;
		return command;
	};

	Generator.createGetHighlightStyleCommand = function(options) {
		var requestCommandContent = JSON.stringify(options);
		var command = Commands.getHighlightStyle + ("[" + requestCommandContent.length + "]") + requestCommandContent;
		return command;
	};

	Generator.createGetContentCommand = function(commandName, ids, token, sceneId) {
		var command = {
			ids: ids.map(function(id) { return parseInt(id, 10); })
		};

		if (token) {
			command.token = token;
		}

		if (sceneId) {
			command.sceneId = sceneId;
		}

		command = JSON.stringify(command);
		return {
			command: commandName + ("[" + command.length + "]") + command,
			method: commandName
		};
	};

	Generator.createRequestContentCommandWtihScenId = function(commandName, ids, sceneId, token) {
		var command = {
			ids: ids.map(function(id) { return parseInt(id, 10); })
		};

		if (sceneId) {
			command.sceneId = sceneId;
		}

		if (token) {
			command.token = token;
		}

		command = JSON.stringify(command);
		return {
			command: commandName + ("[" + command.length + "]") + command,
			method: commandName
		};
	};

	Generator.createAddClientLogCommand = function(log) {

		var command = {
			duration: log.duration
		};

		if (log.name) {
			command.name = log.name;
		}

		if (log.message) {
			command.message = log.message;
		}

		if (log.token) {
			command.token = log.token;
		}

		if (log.error) {
			command.error = log.error;
		}

		if (log.result && log.result === "failuer") {
			command.error = log.message;
		}

		if (log.timestamp) {
			command.timestamp = log.timestamp;
		}

		command = JSON.stringify(command);
		command = Commands.addClientLog + ("[" + command.length + "]") + command;

		return command;
	};

	return Generator;
});
