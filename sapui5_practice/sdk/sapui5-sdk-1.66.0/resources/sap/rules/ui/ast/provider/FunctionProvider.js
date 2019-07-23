sap.ui.define(["sap/rules/ui/ast/model/Function",
	"sap/rules/ui/ast/constants/Constants"
], function (Function, Constants) {
	'use strict';

	var oInstance;

	var FunctionProvider = function () {
		this._oFunctionsBusinessDataTypeMap = {};
		this._oFunctionsDataObjectTypeMap = {};
		this._oFunctionsCategoryMap = {};
		this._oFunctionsNameMap = {};
		this._oFunctionsLabelMap = {};
	};

	FunctionProvider.prototype.reset = function () {
		this._oFunctionsBusinessDataTypeMap = {};
		this._oFunctionsDataObjectTypeMap = {};
		this._oFunctionsCategoryMap = {};
		this._oFunctionsNameMap = {};
		this._oFunctionsLabelMap = {};
	};

	FunctionProvider.prototype.getAllFunctions = function () {
		return Object.values(this._oFunctionsNameMap);
	};

	FunctionProvider.prototype.getFunctionByName = function (name) {
		return this._oFunctionsNameMap[name];
	};

	FunctionProvider.prototype.addFunctionToNameMap = function (oFunction) {
		var name = oFunction.getName();
		// TODO : Find duplicates and handle accordingly
		this._oFunctionsNameMap[name] = oFunction;
	};

	FunctionProvider.prototype.getFunctionByLabel = function (label) {
		return this._oFunctionsLabelMap[label];
	};

	FunctionProvider.prototype.addFunctionToLabelMap = function (oFunction) {
		var label = oFunction.getLabel();
		// TODO : Find duplicates and handle accordingly
		if (label)
			this._oFunctionsLabelMap[label] = oFunction;
	};

	FunctionProvider.prototype.getAllFunctionsByBusinessDataType = function (type) {
		return this._oFunctionsBusinessDataTypeMap[type];
	};

	FunctionProvider.prototype.getAllFunctionsByDataObjectType = function (type) {
		return this._oFunctionsDataObjectTypeMap[type];
	};

	FunctionProvider.prototype.getAllFunctionsByCategory = function (type) {
		return this._oFunctionsCategoryMap[type];
	};

	FunctionProvider.prototype.getAllFunctionsGivenDataObjectAndBusinessDataType = function (sDataObjectType, sBusinessDataType) {
		var aFunctions = [];
		var aBusinessDataTypeFunctions = this.getAllFunctionsByBusinessDataType(sBusinessDataType);
		aBusinessDataTypeFunctions = aBusinessDataTypeFunctions ? aBusinessDataTypeFunctions : [];
		var oFunction;
		for (var lOuterIndex = 0; lOuterIndex < aBusinessDataTypeFunctions.length; lOuterIndex++) {
			oFunction = aBusinessDataTypeFunctions[lOuterIndex];
			var aDataObjectTypeList = oFunction.getReturnDataObjectTypeList();
			if (!aDataObjectTypeList && oFunction.getReturnValueDataObjectTypeCollection()) {
				aDataObjectTypeList = Object.keys(oFunction.getReturnValueDataObjectTypeCollection());
			}
			for (var lInnerIndex = 0; lInnerIndex < aDataObjectTypeList.length; lInnerIndex++) {
				if (aDataObjectTypeList[lInnerIndex] == sDataObjectType) {
					aFunctions.push(oFunction);
					break;
				}
			}
		}
		return aFunctions;
	};

	FunctionProvider.prototype.createFunction = function (name, label, category, noofArgs, noOfMandatoryArgs, argsMetadata,
		returnDataObjectTypeList, defaultReturnDataObjectType, defaultReturnBusinessDataType, returnValueBusinessDataTypeCollection,
		returnValueDataObjectTypeCollection) {
		return new Function().setName(name).setLabel(label).setCategory(category).setNumberOfArguments(noofArgs)
			.setNoOfMandatoryArgs(noOfMandatoryArgs).setArgumentsMetadata(argsMetadata)
			.setReturnDataObjectTypeList(returnDataObjectTypeList).setDefaultReturnDataObjectType(defaultReturnDataObjectType)
			.setDefaultReturnBusinessDataType(defaultReturnBusinessDataType).setReturnValueBussinessDataTypeCollection(
				returnValueBusinessDataTypeCollection).setReturnValueDataObjectTypeCollection(returnValueDataObjectTypeCollection);
	};

	FunctionProvider.prototype.addFunctionToBusinessDataTypeMap = function (oFunction) {
		// Add Function to BusinessDataType map
		var oFunctionArgsMetadata = oFunction.getArgumentsMetadata();

		var lOuterIndex = 0;

		if (oFunctionArgsMetadata) {
			for (lOuterIndex = 0; lOuterIndex < oFunctionArgsMetadata.length; lOuterIndex++) {
				var oArg = oFunctionArgsMetadata[lOuterIndex];
				if (oArg[Constants.DETERMINESRETURNDATAOBJECTTYPE] == Constants.YES) {
					var aReturnBusinessDataTypeList = oArg[Constants.RETURNVALUE_BUSINESSDATA_TYPE_LIST];
					aReturnBusinessDataTypeList = aReturnBusinessDataTypeList ? aReturnBusinessDataTypeList : [];
					for (var lInnerIndex = 0; lInnerIndex < aReturnBusinessDataTypeList.length; lInnerIndex++) {
						var type = aReturnBusinessDataTypeList[lInnerIndex];
						if (!this._oFunctionsBusinessDataTypeMap[type]) {
							this._oFunctionsBusinessDataTypeMap[type] = [];
						}
						// TODO : check for duplicates
						this._oFunctionsBusinessDataTypeMap[type].push(oFunction);
					}
				}
			}

		} else {
			var l = [];
			oFunctionArgsMetadata = oFunction.getReturnValueBussinessDataTypeCollection();
			for (var testvalue in oFunctionArgsMetadata) {
				for (var qValue in oFunctionArgsMetadata[testvalue]) {
					var type = oFunctionArgsMetadata[testvalue][qValue];
					if (!this._oFunctionsBusinessDataTypeMap[type]) {
						this._oFunctionsBusinessDataTypeMap[type] = [];
					}
					if (!l.includes(type)) {
						this._oFunctionsBusinessDataTypeMap[type].push(oFunction);
						l.push(type);
					}

				}
			}

		}

	};

	FunctionProvider.prototype.addFunctionToDataObjectTypeMap = function (oFunction) {
		// Add Function to DataObjectType map
		var oFunctionDataObjectTypeCollectionMap = oFunction.getReturnDataObjectTypeList();

		if (oFunctionDataObjectTypeCollectionMap) {
			for (var lIndex = 0; lIndex < oFunctionDataObjectTypeCollectionMap.length; lIndex++) {
				var type = oFunctionDataObjectTypeCollectionMap[lIndex];
				if (!this._oFunctionsDataObjectTypeMap[type]) {
					this._oFunctionsDataObjectTypeMap[type] = [];
				}
				// TODO : check for duplicates

				this._oFunctionsDataObjectTypeMap[type].push(oFunction);

			}
		} else {
			oFunctionDataObjectTypeCollectionMap = oFunction.getReturnValueDataObjectTypeCollection();
			for (var testvalue in oFunctionDataObjectTypeCollectionMap) {
				for (var qValue in oFunctionDataObjectTypeCollectionMap[testvalue]) {
					var type = oFunctionDataObjectTypeCollectionMap[testvalue][qValue];
					if (!this._oFunctionsDataObjectTypeMap[type]) {
						this._oFunctionsDataObjectTypeMap[type] = [];
					}
					this._oFunctionsDataObjectTypeMap[type].push(oFunction);

				}
			}
		}
	};

	FunctionProvider.prototype.addFunctionToCategoryMap = function (oFunction) {
		// Add Function to Category map
		var functionCategory = oFunction.getCategory();
		if (!this._oFunctionsCategoryMap[functionCategory]) {
			this._oFunctionsCategoryMap[functionCategory] = [];
		}
		// TODO : check for duplicates

		this._oFunctionsCategoryMap[functionCategory].push(oFunction);

	};

	return {
		getInstance: function () {
			if (!oInstance) {
				oInstance = new FunctionProvider();
				oInstance.constructor = null;
			}
			return oInstance;
		}
	};

}, true);