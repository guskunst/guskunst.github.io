sap.ui.define([
	"./SceneStateContext", "./Processor", "./Commands", "./Generator", "./SceneState", "./TotaraUtils",
	"sap/ui/thirdparty/URI"
], function(SceneStateContext, Processor, Commands, Generator, SceneState, TotaraUtils, URI) {
	"use strict";

	var TotaraLoader = function() {

		var _state = new SceneState();
		var _pushMesh = false;
		var _pushAnnotation = false;
		var _commandProcessor = new Processor();
		var _url = null;

		var that = this;
		_state.loader = this;

		function sendRequest(requestCommandGenerator, token) {
			if (!that._worker) {
				return false;
			}

			var somethingRequested = false;

			if (requestCommandGenerator) {
				while (requestCommandGenerator.canGenerateCommand()) {
					var newCommand = requestCommandGenerator.generateRequestCommand(true, token);

					that._worker.postMessage(newCommand);
					somethingRequested = true;
				}
			}

			return somethingRequested;
		}

		function sendRequests() {

			var somethingRequested = false;
			var token;

			var valueIterator = _state.contextMap.values();
			var ci = valueIterator.next();
			while (!ci.done) {
				var context = ci.value;
				ci = valueIterator.next();
				if (sendRequest(context.requestCommandGenerator, context.token)) {
					somethingRequested = true;
				}
				token = context.token;
			}

			if (!somethingRequested) { // if nothing requested for individual context, load common ones. (mostly geometry)

				// grab token from last the context. as token is for debuging/performance
				// and we normally load one model for debuging/performance, should be ok.
				// if not, we can generate token for the state.requestCommandGenerator
				sendRequest(_state.requestCommandGenerator, token);
			}
		}

		this.getUrl = function() {
			return _url;
		};

		this.init = function(ssurl) {

			_url = ssurl;

			// when graph or tree are done
			function onFinishHierarchy(context) {
				if (context) {
					context.phase = SceneStateContext.Phase.FinishedHierarchy;
				}

				if (!_pushMesh) {
					// manually request mesh
					var meshGroupListMap = context.meshGroupListMap;
					var meshIdsToRequest = new Set(meshGroupListMap.keys());
					context.requestCommandGenerator.pushMeshIds(meshIdsToRequest);

					if (meshIdsToRequest.size === 0) {

						if (context.retrievalType === SceneStateContext.RetrievalType.Initial) {
							context.onInitialSceneFinishedCallbacks.execute();
						}

						// mesh request can be zero when we do partial tree update which is just delete
						if (context.retrievalType === SceneStateContext.RetrievalType.Partial) {
							context.onPartialRetrievalFinishedCallbacks.execute();
						}

						context.onViewPartialRetrievalFinishedCallbacks.execute();

						if (context.isSceneCompleted()) {
							context.onSceneCompletedCallbacks.execute();
						}
					}
				}

				var materialIds = _state.materialIdsToRequest;
				if (materialIds && materialIds.size) {
					materialIds.forEach(function(id) {
						_state.materialIdsRequested.add(id);
					});
					_state.requestCommandGenerator.pushMaterialIds(materialIds);
					_state.materialIdsToRequest.clear();
				}

				if (!_pushAnnotation && context.annotationNodeMap.size > 0) {
					context.requestCommandGenerator.pushAnnotationIds(Array.from(context.annotationNodeMap.keys()));
				}

				sendRequests();
			}

			_commandProcessor.setCommandCallback(Commands.notifyFinishedTree,
				function(commandResult) {
					if (commandResult.error) {
						return;
					}

					var context = commandResult.context;
					onFinishHierarchy(context);
				});

			_commandProcessor.setCommandCallback(Commands.setMesh,
				function(commandResult) {
					if (commandResult.error) {
						return;
					}

					// _state.requestCommandGenerator.pushMaterialIds(commandResult.materialIdSet);
					var materialIds = _state.materialIdsToRequest;
					if (materialIds && materialIds.size) {
						materialIds.forEach(function(id) {
							_state.materialIdsRequested.add(id);
						});
						_state.requestCommandGenerator.pushMaterialIds(materialIds);
						_state.materialIdsToRequest.clear();
					}
					_state.requestCommandGenerator.pushGeometryIds(commandResult.geometryIdMap);
					if (commandResult.updatedContexts) {

						for (var i = 0; i < commandResult.updatedContexts.length; i++) {
							var context = commandResult.updatedContexts[i];
							if (context.meshGroupListMap.size === 0) {
								// all meshes were updated for this model
								context.phase = SceneStateContext.Phase.FinishedMesh;

								context.onMeshFinishedCallbacks.execute();

								if (context.retrievalType === SceneStateContext.RetrievalType.Initial) {
									context.onInitialSceneFinishedCallbacks.execute();
								} else if (context.retrievalType === SceneStateContext.RetrievalType.Partial) {
									context.onPartialRetrievalFinishedCallbacks.execute();
								}

								context.onViewPartialRetrievalFinishedCallbacks.execute();

								if (context.isSceneCompleted()) {
									context.onSceneCompletedCallbacks.execute();
								}

								context.progressCount.geometry.total = context.boundingBoxNodeIdsListMap.size;

								var token = context.token;
								if (context.isSceneCompleted()) {
									logPerformance(context, "sceneCompleted", token);
								} else {
									logPerformance(context, "meshFinished", token);
								}
							}
						}
					}

					sendRequests();
				});

			_commandProcessor.setCommandCallback(Commands.setGeometry,
				function(commandResult) {
					if (commandResult.error) {
						return;
					}

					_state.onSetGeometryCallbacks.execute(commandResult);

					if (commandResult.updatedContexts) { // if the geometry updated something in this model..
						for (var i = 0; i < commandResult.updatedContexts.length; i++) {
							var context = commandResult.updatedContexts[i];

							if (context.isSceneCompleted()) {
								context.onSceneCompletedCallbacks.execute();

								var token = context.token;
								if (context.isSceneCompleted()) {
									logPerformance(context, "sceneCompleted", token);
								} else {
									logPerformance(context, "geometryFinished", token);
								}

								context.finishedTime = Date.now();
							}
						}
					}
				});

			_commandProcessor.setCommandCallback(Commands.setAnnotation, function(commandResult) {
				var materialIds = _state.materialIdsToRequest;
				if (materialIds && materialIds.size) {
					materialIds.forEach(function(id) {
						_state.materialIdsRequested.add(id);
					});
					_state.requestCommandGenerator.pushMaterialIds(materialIds);
					_state.materialIdsToRequest.clear();
					sendRequests();
				}
			});

			_commandProcessor.setCommandCallback(Commands.setTree,
				function(command) {
					if (command.result && command.result === "failure" && command.context) {
						_state.contextMap.delete(command.context.sceneId);
					}
				});

			_commandProcessor.setCommandCallback(Commands.setViewGroup,
				function(result) {
					if (result.context) {
						result.context.requestCommandGenerator.pushViewIds(result.viewIdSet);
						_state.requestCommandGenerator.pushImageIds(result.imageIdSet);
						sendRequests();
					}
				});

			_commandProcessor.setCommandCallback(Commands.notifyFinishedView,
				function(result) {
					if (result.error) {
						return;
					}

					var context = result.context;
					if (context) {

						var materialIds = _state.materialIdsToRequest;
						if (materialIds && materialIds.size) {
							materialIds.forEach(function(id) {
								_state.materialIdsRequested.add(id);
							});
							_state.requestCommandGenerator.pushMaterialIds(materialIds);
							_state.materialIdsToRequest.clear();
							sendRequests();
						}

						if (_state.highlightStyleIds.size) {
							_state.requestCommandGenerator.pushHighlightStyleIds(_state.highlightStyleIds);
							sendRequests();
						}
						// this view does not require any mesh request
						// meaning we can handle the view without any request
						// let't declare view is finished
						if (result.view) {
							var ns = [];
							context.updatedNodes.forEach(function(value){ ns.push(value); });
							result.view.updatedNodes = ns; // Array.from(context.updatedNodes);
							context.viewIds.delete(result.viewId);
						}

						if (context.viewIds.size === 0) {
							_state.sceneBuilder.finalizeViewGroups(context.sceneId);
							_state.onViewGroupUpdatedCallbacks.execute();
							if (_state.sequenceIds.size === 0){
								_state.onViewGroupFinishedCallbacks.execute();
							}
						}

						if (context.meshGroupListMap.size === 0) {
							context.onViewFinishedCallbacks.execute(result.view);
						} else {
							// seems like we need to get more stuff as some items in the view
							// are not here atm.
							// context.retrievalType = SceneStateContext.RetrievalType.Partial; // need to get some more items

							var meshIdsToRequest = new Set(context.meshGroupListMap.keys());
							context.requestCommandGenerator.pushMeshIds(meshIdsToRequest);

							var callback = function() {
								context.onViewPartialRetrievalFinishedCallbacks.detach(callback);
								context.onViewFinishedCallbacks.execute(result.view); // now the view is finished
							};
							context.onViewPartialRetrievalFinishedCallbacks.attach(callback);

							logPerformance(context, "notifyFinishedView", context.token);

							sendRequests();
						}
					}
					sendRequests();
				});

			_commandProcessor.setCommandCallback(Commands.setMaterial,
				function(result) {
					if (result.error) {
						_state.onMaterialFinishedCallbacks.execute();
						return;
					}

					result.forEach(function(value, key) {
						_state.requestCommandGenerator.pushImageIds(value);
						_state.onMaterialFinishedCallbacks.execute(key);
					});

					sendRequests();
				});

			_commandProcessor.setCommandCallback(Commands.setImage,
				function(result) {
					if (result.error) {
						return;
					}

					if (_state.texturesToUpdate.get(result.id) == null) {
						// There are no other textures waiting for this image, call the callback
						_state.onImageFinishedCallbacks.execute(result);
					}
					sendRequests();
				});

			_commandProcessor.setCommandCallback(Commands.setHighlighStyle,
				function(result) {
					if (result.error) {
						return;
					}
					if (_state.highlightStyleIds.size > 0) {
						sendRequests();
					} else {
						_state.sceneBuilder.finalizeHighlightsInViews();
					}
				});

			_commandProcessor.setCommandCallback(Commands.setView,
				function(result) {
					if (result.error) {
						return;
					}
					var context = result.context;
					var token = context ? context.token : null;
					logPerformance(context, "setView", token);
				});


			_commandProcessor.setCommandCallback(Commands.setPlayback,
				function(result) {
					if (result.error) {
						return;
					}

					if (result.sequenceIdSet.size > 0) {
						_state.hasAnimation = true;
						var sceneId = _state.viewIdSceneIdMap.get(result.viewId);
						var context = _state.getContext(sceneId);
						if (context) {
							context.requestCommandGenerator.pushSequenceIds(result.sequenceIdSet);
						}
						sendRequests();
					} else {
						_state.sceneBuilder.finalizeAnimation();
						_state.sceneBuilder.finalizePlaybacks();
						_state.sceneBuilder.finalizeHighlightsInViews();
						_state.hasAnimation = false;
					}
				});

			_commandProcessor.setCommandCallback(Commands.setSequence,
				function(result) {
					if (result.error) {
						return;
					}

					if (_state.sequenceIds.size > 0) {
						sendRequests();
					}

					if (result.trackIdSet.size > 0) {
						_state.requestCommandGenerator.pushTrackIds(result.trackIdSet);
						sendRequests();
					} else {
						_state.hasAnimation = false;
						_state.onSetSequenceCallbacks.execute();

						var allViewsRead = true;
						var values = _state.contextMap.values();
						var next = values.next();
						while (!next.done) {
							var con = next.value;
							if (con.viewIds.size > 0) {
								allViewsRead = false;
								break;
							}
							next = values.next();
						}
						if (allViewsRead) {
							_state.onViewGroupFinishedCallbacks.execute();
						}
					}
				});

			_commandProcessor.setCommandCallback(Commands.setTrack,
				function(result) {
					if (result.error) {
						return;
					}

					if (_state.trackIds.size > 0) {
						sendRequest();
					} else {
						_state.sceneBuilder.finalizeAnimation();
						_state.sceneBuilder.finalizePlaybacks();
						_state.sceneBuilder.finalizeHighlightsInViews();
						_state.onSetTrackCallbacks.execute();

						var allViewsRead = true;
						var values = _state.contextMap.values();
						var next = values.next();
						while (!next.done) {
							var con = next.value;
							if (con.viewIds.size > 0) {
								allViewsRead = false;
								break;
							}
							next = values.next();
						}
						if (allViewsRead) {
							_state.onViewGroupFinishedCallbacks.execute();
						}
					}
				});

			_commandProcessor.setCommandCallback(Commands.notifyError,
				function(result) {
					_state.onErrorCallbacks.execute(result);
				});

			var that = this;
			return new Promise(function(resolve) {
				if (!that._worker) {
					// The script URL cannot be used directly with WebWorker as this causes CORS error with FLP
					// As a workaround we can pass script URL to WebWorker as a Blob

					var uri = new URI(sap.ui.require.toUrl("sap/ui/vk/totara/TotaraLoaderWorker.js"));
					if (uri.is("relative")) {
						uri = uri.absoluteTo(new URI(location.href));
					}

					var scriptList = "'" + uri.toString() + "'";
					if (sap.ui.Device.browser.internet_explorer) {
						// We need to include polyfills for IE11 as they are not automatically loaded in WebWorker
						var polyfillPromise = new URI(sap.ui.require.toUrl("sap/ui/thirdparty/es6-promise.js"));
						var polyfillString = new URI(sap.ui.require.toUrl("sap/ui/thirdparty/es6-string-methods.js"));
						if (polyfillPromise.is("relative")) {
							polyfillPromise = polyfillPromise.absoluteTo(new URI(location.href));
							polyfillString = polyfillString.absoluteTo(new URI(location.href));
						}
						scriptList = "'" + polyfillPromise.toString() + "','" + polyfillString.toString() + "'," + scriptList;
					}

					that._worker = new Worker((window.URL || window.webkitURL).createObjectURL(
						new Blob([ "importScripts(" + scriptList + ");" ], { "type": "application/javascript" })));

					that._worker.onmessage = function(event) {
						var data = event.data;
						if (data.ready) {
							// Just an initial signal that worker is ready for processing
							return;
						}

						if (data.name === "getAuthorization") {
							// If the application provided authorization handler then we will call it
							var context;

							if (data.sceneId) {
								context = _state.getContext(data.sceneId);
							}

							if (context && context.authorizationHandler) {
								context.authorizationHandler(data.jsonContent.url).then(function(token) {
									that._worker.postMessage({
										"method": "setAuthorization",
										"authorizationToken": token
									});
								})
								.catch(function(err) {
									that._worker.postMessage({
										"method": "setAuthorization",
										"authorizationToken": null,
										"error": err.toString()
									});
								});
							} else {
								that._worker.postMessage({
									"method": "setAuthorization",
									"authorizationToken": null
								});
							}
							return;
						}

						// Process command messages
						var command = { name: data.name,
							jsonContent: data.jsonContent
						};

						if (data.binaryContent) {
							command.binaryContent = data.binaryContent;
						}

						_commandProcessor.process(_state, command);
					};

					that._worker.onerror = function(event) {
						// Log.error("Error in WebWorker", event);
					};
				}
			});
		};

		// if pushMesh is disabled (which is default), loader will try to request meshes
		// then geometries. If this is set to true, we assume we have everything already and do not
		// request anything
		this.enablePushMesh = function(enable) {
			_pushMesh = enable;
		};

		this.dispose = function() {

			_commandProcessor = null;

			if (_state) {

				if (_state.contextMap) {
					// stop the loggers if we have them
					var valueIterator = _state.contextMap.values();
					var ci = valueIterator.next();
					while (!ci.done) {
						var context = ci.value;
						ci = valueIterator.next();
						context.dispose();
					}
				}
				_state.dispose();
				_state = null;
			}

			if (this._worker) {
				this._worker.terminate();
				this._worker = undefined;
			}
		};

		function logPerformance(context, name, token) {
			if (context && context.progressLogger && token && name) {
				context.progressLogger.logPerformance(name, token);
			}
		}

		this.request = function(sceneVeId, contextParams, authorizationHandler) {

			if (!contextParams.root) {
				throw "context must include root where three js objects are attached to";
			}

			var context = _state.createContext(sceneVeId, contextParams);

			_state.currentSceneInfo.id = sceneVeId;
			context.retrievalType = SceneStateContext.RetrievalType.Initial;
			context.authorizationHandler = authorizationHandler;

			context.initialRequestTime = Date.now();

			var token;
			if (context.enableLogger) {
				var logger = TotaraUtils.createLogger(sceneVeId, context, this);
				if (logger) {
					token = TotaraUtils.generateToken(); // only define token if we log.
					context.token = token;
				}
			}

			var includeHidden = contextParams.includeHidden !== undefined ? contextParams.includeHidden : true; // include hidden by default
			var includeAnimation = contextParams.includeAnimation !== undefined ? contextParams.includeAnimation : true; // include animation by default
			var selectField = contextParams.$select !== undefined ? contextParams.$select : "name,transform,meshId,annotationId,materialId,contentType,visible,opacity,renderOrder";
			var pushViewGroups = contextParams.pushViewGroups !== undefined ? contextParams.pushViewGroups : true;

			var options = {
				pushMaterials: true,
				pushMeshes: _pushMesh,
				includeHidden: includeHidden,
				includeAnimation: includeAnimation,
				pushPMI: contextParams.pushPMI || false,
				metadataFilter: contextParams.metadataFilter,
				token: token,
				pushViewGroups: pushViewGroups,
				$select: selectField
			};

			if (contextParams.activateView) {
				options.activateView = contextParams.activateView;
			}

			options.sceneId = sceneVeId;
			options.context = sceneVeId;

			var commandInStr =
				Generator.createGetTreeCommand(options);

			logPerformance(context, "modelRequested", token);

			this._worker.postMessage(
				{
					method: "initializeConnection",
					url: _url,
					useSecureConnection: contextParams.useSecureConnection,
					token: context.token,
					command:	commandInStr,
					sceneId: sceneVeId
				}
			);
		};

		this.postMessage = function(message) {
			this._worker.postMessage(message);
		};

		// Returns promise that performs partial tree retrieval
		// Partial tree retrival is considered finished when we get all the meshes
		// If there is no need to retrieve meshes (e.g delete node), it will finish
		// when the tree building is finished.
		// viewId is optional
		this.update = function(sceneVeId, sidArray, viewId) {
			var that = this;

			_state.currentSceneInfo.id = sceneVeId;

			return new Promise(function(resolve, reject) {
				var context = _state.getContext(sceneVeId);

				if (!context) {
					reject("no context for ${sceneVeId}.");
				}

				// context.nodeSidsForPartialTree.clear();
				context.nodeSidsForPartialTree = new Set(sidArray);

				context.retrievalType = SceneStateContext.RetrievalType.Partial;
				var includeHidden = context.includeHidden !== undefined ? context.includeHidden : true; // include hidden by default
				var includeAnimation = context.includeAnimation !== undefined ? context.includeAnimation : true; // include animation by default
				var selectField = context.$select !== undefined ? context.$select : "name,transform,meshId,annotationId,materialId,contentType,visible,opacity,renderOrder";
				var pushViewGroups = context.pushViewGroups !== undefined ? context.pushViewGroups : true;

				var options = {
					pushMaterials: true,
					pushMeshes: _pushMesh,
					filter: sidArray.join(),
					includeAnimation: includeAnimation,
					includeHidden: includeHidden,
					pushPMI: context.pushPMI || false,
					metadataFilter: context.metadataFilter,
					pushViewGroups: pushViewGroups,
					$select: selectField,
					breadcrumbs: true
				};

				var token;
				if (context.progressLogger) {
					token = TotaraUtils.generateToken();
					context.token = token;
				}

				// we can update by sid in tree way only
				options.sceneId = sceneVeId;
				options.context = sceneVeId;

				if (viewId) {
					options.activateView = viewId;
				}

				var commandInStr =
					Generator.createGetTreeCommand(options);

				var callback = function() {
					context.onPartialRetrievalFinishedCallbacks.detach(callback);
					logPerformance(context, "updateFinished(mesh)", token);
					var rnks = [];
					var rnvs = [];
					context.replacedNodes.forEach(function(value, key){ rnvs.push(value); rnks.push(key); });

					var replacedNodes = rnks; // Array.from(context.replacedNodes.keys());
					var replacementNodes = rnvs; // Array.from(context.replacedNodes.values());
					resolve({
						sceneVeId: sceneVeId,
						sids: sidArray,
						replacedNodeRefs: replacedNodes,
						replacementNodeRefs: replacementNodes
					}); // succesfully finished partial retrieval
				};

				context.onPartialRetrievalFinishedCallbacks.attach(callback);

				logPerformance(context, "updateRequested", token);
				// connection.send(commandInStr, context);

				that._worker.postMessage(
					{
						method: "update",
						command: commandInStr
					}
				);
			});
		};

		this.requestViewGroup = function(sceneVeId, viewGroupId) {
			if (!viewGroupId) {
				return Promise.reject("invalid arg: viewGroupId undefined");
			}

			var context = _state.getContext(sceneVeId);
			if (!context) {
				return Promise.reject("no scene exist for ${sceneVeId}");
			}

			var that = this;
			var promise = new Promise(function(resolve, reject) {
				var views = _state.sceneBuilder.getViewGroup(viewGroupId, sceneVeId);
				if (views && views.length) {
					resolve(views);
					return;
				}
				var token;
				if (context.progressLogger) {
					token = TotaraUtils.generateToken();
					context.token = token;
				}

				var options = {
					sceneId: sceneVeId,
					id: viewGroupId,
					token: token
				};

				var commandInStr = Generator.createGetViewGroupsCommand(options);
				var commandMethod = Commands.getViewGroups;

				var callback = function() {
					_state.onViewGroupFinishedCallbacks.detach(callback);

					logPerformance(context, "onViewGroupFinished", token);

					var viewgroup = _state.sceneBuilder.getViewGroup(viewGroupId, sceneVeId);
					if (viewgroup && viewgroup.length) {
						resolve(viewgroup);
					} else {
						reject("no view ground data");
					}
				};
				_state.onViewGroupFinishedCallbacks.attach(callback);

				context.currentViewGroupId = viewGroupId;

				that._worker.postMessage(
					{
						method: commandMethod,
						command:	commandInStr
					}
				);
			});
			return promise;
		};

		this.requestView = function(sceneVeId, viewType, viewId, useCurrentDataIfAvailable) {

			_state.currentSceneInfo.id = sceneVeId;

			if (viewType !== "static" && viewType !== "dynamic") {
				return Promise.reject("invalid arg: supported type - static, dynamic");
			}

			if (!viewId) {
				return Promise.reject("invalid arg: viewId undefined");
			}

			var context = _state.getContext(sceneVeId);
			if (!context) {
				return Promise.reject("no scene exist for ${sceneVeId}");
			}

			_state.viewIdSceneIdMap.set(viewId, sceneVeId);

			var token;
			if (context.progressLogger) {
				token = TotaraUtils.generateToken();
				context.token = token;
			}

			var includeHidden = context.includeHidden !== undefined ? context.includeHidden : false; // not include hidden by default
			var includeAnimation = context.includeAnimation !== undefined ? context.includeAnimation : true; // include animation by default
			var selectField = context.$select !== undefined ? context.$select : undefined;

			_state.hasAnimation = false;   // will be check on callback of setPlayback.

			var that = this;
			var options;
			var promise = new Promise(function(resolve, reject) {

				if (useCurrentDataIfAvailable) {
					var view = _state.sceneBuilder.getView(viewId, sceneVeId);
					if (view) {
						resolve(view);
						return;
					}
				}

				var commandInStr = "";
				var commandMethod;
				if (viewType === "static") {
					options = {
						sceneId: sceneVeId,
						id: viewId,
						token: token,
						includeHidden: includeHidden,
						includeAnimation: includeAnimation,
						$select: selectField
					};

					commandInStr += Generator.createGetViewCommand(options);
					commandMethod = Commands.getView;
				} else {
					options = {
						sceneId: sceneVeId,
						type: viewId,
						token: token
					};
					commandInStr += Generator.createGetDynamicViewCommand(options);
					commandMethod = Commands.getDynamicView;
				}

				var callback = function(resultView) {
					context.onViewFinishedCallbacks.detach(callback);

					logPerformance(context, "onViewFinished", token);

					if (!_state.hasAnimation){
						if (resultView) {
							resolve(resultView);
						} else {
							reject("no view data");
						}
					} else {
						context.currentView = resultView;

					}
				};

				context.onViewFinishedCallbacks.attach(callback);

				var setSequenceCallback = function() {
					_state.onSetSequenceCallbacks.detach(setSequenceCallback);

					logPerformance(context, "onSetSequence", token);

					if (context.currentView){
						resolve(context.currentView);
					} else {
						reject("no view data");
					}

				};

				_state.onSetSequenceCallbacks.attach(setSequenceCallback);

				var setTrackCallback = function(resultView) {
					_state.onSetTrackCallbacks.detach(setTrackCallback);

					logPerformance(context, "onSetTrack", token);

					if (context.currentView){
						resolve(context.currentView);
					} else {
						reject("no view data");
					}
				};

				_state.onSetTrackCallbacks.attach(setTrackCallback);

				logPerformance(context, "viewRequested", token);

				that._worker.postMessage(
					{
						method: commandMethod,
						command:	commandInStr
					}
				);
			});

			return promise;
		};

		this.requestMaterial = function(materialId) {

			if (!materialId) {
				return Promise.reject("invalid arg: materialId undefined");
			}

			var promise = new Promise(function(resolve, reject) {

				var material = _state.sceneBuilder.getMaterial(materialId);

				if (material) {
					resolve(material);
					return;
				}

				_state.requestCommandGenerator.pushMaterialIds([ materialId ]);
				_state.materialIdsRequested.add(materialId);

				var imageFinishedCallback = function(result) {
					var m = _state.sceneBuilder.getMaterial(materialId);

					if (m && m.userData && m.userData.idsOfImagesToRead) {
						if (!m.userData.idsOfImagesToRead.has(result.id)){
							// Image is not for this material
							return;
						} else {
							m.userData.idsOfImagesToRead.delete(result.id);
						}

						if (m.userData.idsOfImagesToRead.size) {
							// There are more images coming for this material, don't resolve it yet
							return;
						} else {
							// No more images, this material is now completed, resolve the promise
							resolve(m);
						}
					} else {
						reject("no material data");
					}

					_state.onImageFinishedCallbacks.detach(imageFinishedCallback);
				};

				var materialFinishedCallback = function(newMaterialId) {
					if (materialId != newMaterialId) {
						return;
					}
					_state.onMaterialFinishedCallbacks.detach(materialFinishedCallback);

					var m = _state.sceneBuilder.getMaterial(materialId);

					if (m && m.userData && m.userData.idsOfImagesToRead && m.userData.idsOfImagesToRead.size) {
						// We are waiting for material textures to arrive
						return;
					}

					// No texture images to load, detach image callback and resolve promise
					_state.onImageFinishedCallbacks.detach(imageFinishedCallback);

					if (m != null) {
						resolve(m);
					} else {
						reject("no material data");
					}
				};

				_state.onMaterialFinishedCallbacks.attach(materialFinishedCallback);

				_state.onImageFinishedCallbacks.attach(imageFinishedCallback);

				sendRequests();
			});

			return promise;
		};

		this.getState = function() {
			return _state;
		};

		this.decrementResourceCountersForDeletedTreeNode = function(state, context, nodeId) {
			state.sceneBuilder.decrementResourceCountersForDeletedTreeNode(nodeId, context.sceneId);
		};

		this.printLogTokens = function() {
/* eslint-disable no-console */
			if (!_state || !_state.contextMap) {
				 console.log("printLogTokens:no data to print");
				return;
			}

			var entrieIterator = _state.contextMap.entries();
			var item = entrieIterator.next();
			while (!item.done) {
				var sceneId = item.key;
				var context = item.value;
				item = entrieIterator.next();

				console.log("log tokens for scene => " + sceneId);
				console.log("---------------------------------------");
				if (context.progressLogger) {
					var tokens = context.progressLogger.getTokens();

					var keyIterator = tokens.keys();
					var keyItem = keyIterator.next();
					while (!keyItem.done) {
						var t = keyItem.value;
						keyIterator.next();
						console.log(t);
					}
				}
				console.log("---------------------------------------");
			}
/* eslint-enable no-console */
		};

		this.getSceneBuilder = function(){
			if (_state){
				return _state.sceneBuilder;
			}
			return null;
		};
	};
	return TotaraLoader;
});