/*global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/viz/ui5/theming/Util",
	"sap/ui/core/theming/Parameters"
], function(Util, Parameters) {

QUnit.module("Theming Util");
  
QUnit.test("read CSS parameters", function(assert){
    Util._mapping = {
            "sapUiChartBackgroundColor" : ["general.background.color",
                                           "plotArea.background.color"],
            "sapUiChartCategoryAxisLineColor" : "categoryAxis.color",
            "sapUiChartValueAxisLineColor" : "valueAxis.color"
    };
    
    var expected = {
            "general" : {
                "background" : {
                    "color" : Parameters.get("sapUiChartBackgroundColor")
                }
            },
            "plotArea" : {
                "background" : {
                    "color" : Parameters.get("sapUiChartBackgroundColor")
                }
            },
            "categoryAxis" : {
                "color" : Parameters.get("sapUiChartCategoryAxisLineColor")
            },
            "valueAxis" : {
                "color" : Parameters.get("sapUiChartValueAxisLineColor")
            }
            
    }
    
    var result = Util.readCSSParameters("info/line");
    
    assert.deepEqual(result, expected, true, "The mapping from css parameter to properties should be corrected");
    
    var expected_excluded = {
            "general" : {
                "background" : {
                    "color" : Parameters.get("sapUiChartBackgroundColor")
                }
            },
            "plotArea" : {
                "background" : {
                    "color" : Parameters.get("sapUiChartBackgroundColor")
                }
            },
            "categoryAxis" : {
                "color" : Parameters.get("sapUiChartCategoryAxisLineColor")
            } 
    }
    
	  var result_excluded = Util.readCSSParameters("info/dual_line");
    
    assert.deepEqual(result_excluded, expected_excluded, true, "The mapping from css parameter to properties should be corrected");
});

QUnit.start();

});
