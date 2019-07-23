if (!sapzen) {
	var sapzen = {};
}

if (!sapzen.crosstab) {
	sapzen.crosstab = {};
}

if (!sapzen.crosstab.test) {
	sapzen.crosstab.test = {};
}

if (!sapzen.crosstab.test.jsonTestData) {
	sapzen.crosstab.test.jsonTestData = {};
}

sapzen.crosstab.test.jsonTestData.PAGING_Q1_PAGED_3_0 = {

	"control" : {
		"type" : "xtable",
		"id" : "CROSSTAB_1_ia_pt_a",
		"fixedcolheaders" : 3,
		"fixedrowheaders" : 2,
		"totaldatarows" : 18,
		"totaldatacols" : 6,
		"sentdatarows" : 3,
		"sentdatacols" : 3,
		"tilerows" : 5,
		"tilecols" : 3,
		"scrollaction" : "sapbi_page.sendCommandArrayWoEventWoPVT([['BI_COMMAND',null,0,[['BI_COMMAND_TYPE','SUPPRESS_VALIDATION',0]]],['BI_COMMAND',null,1,[['INDEX','__X__',0],['BI_COMMAND_TYPE','NAVIGATE_BY_SCROLLING',0],['TARGET_ITEM_REF','CROSSTAB_1',0],['BIAV','CROSSTAB_1_ia_pt',0],['TYPE','h',0]]],['BI_COMMAND',null,2,[['INDEX','__Y__',0],['BI_COMMAND_TYPE','NAVIGATE_BY_SCROLLING',0],['TARGET_ITEM_REF','CROSSTAB_1',0],['BIAV','CROSSTAB_1_ia_pt',0],['TYPE','v',0]]]]);",
		"v_pos" : 16,
		"rows" : [
				{
					"row" : {
						"rowidx" : "1",
						"cells" : [ {
							"control" : {
								"type" : "xcell",
								"id" : "CROSSTAB_1_ia_pt_0_0",
								"rowspan" : 2,
								"colidx" : 1,
								"style" : "TITLE"
							}
						}, {
							"control" : {
								"type" : "xcell",
								"id" : "CROSSTAB_1_ia_pt_0_1",
								"colidx" : 2,
								"style" : "TITLE",
								"_v" : ""
							}
						}, {
							"control" : {
								"type" : "xcell",
								"id" : "CROSSTAB_1_ia_pt_0_2",
								"colspan" : 3,
								"colidx" : 3,
								"key" : "4MEWGNQTRPEHLRH3AWKSSLH69",
								"style" : "HEADER",
								"_v" : "Net Sales"
							}
						} ]
					}
				},
				{
					"row" : {
						"rowidx" : "2",
						"cells" : [
								{
									"control" : {
										"type" : "xcell",
										"id" : "CROSSTAB_1_ia_pt_1_1",
										"colidx" : 2,
										"style" : "TITLE",
										"_v" : "Product group"
									}
								},
								{
									"control" : {
										"type" : "xcell",
										"id" : "CROSSTAB_1_ia_pt_1_2",
										"colidx" : 3,
										"key" : "4MEWGNQTRPEHLRH3AWKSSLH69/DS30",
										"style" : "HEADER",
										"sort" : "NONE",
										"sortalternativetext" : "Unsorted. Select to sort ascending.",
										"sorttooltip" : "Unsorted. Select to sort ascending.",
										"sortaction" : "sapbi_page.sendCommandArray([['BI_COMMAND',null,0,[['GUID','16',0],['BI_COMMAND_TYPE','ABSTRACT',0]]]]);",
										"_v" : "Hardware software"
									}
								},
								{
									"control" : {
										"type" : "xcell",
										"id" : "CROSSTAB_1_ia_pt_1_3",
										"colidx" : 4,
										"key" : "4MEWGNQTRPEHLRH3AWKSSLH69/DS20",
										"style" : "HEADER",
										"sort" : "NONE",
										"sortalternativetext" : "Unsorted. Select to sort ascending.",
										"sorttooltip" : "Unsorted. Select to sort ascending.",
										"sortaction" : "sapbi_page.sendCommandArray([['BI_COMMAND',null,0,[['GUID','17',0],['BI_COMMAND_TYPE','ABSTRACT',0]]]]);",
										"_v" : "Accessories+space"
									}
								},
								{
									"control" : {
										"type" : "xcell",
										"id" : "CROSSTAB_1_ia_pt_1_4",
										"colidx" : 5,
										"key" : "4MEWGNQTRPEHLRH3AWKSSLH69/SUMME",
										"style" : "TOTAL",
										"sort" : "NONE",
										"sortalternativetext" : "Unsorted. Select to sort ascending.",
										"sorttooltip" : "Unsorted. Select to sort ascending.",
										"sortaction" : "sapbi_page.sendCommandArray([['BI_COMMAND',null,0,[['GUID','18',0],['BI_COMMAND_TYPE','ABSTRACT',0]]]]);",
										"_v" : "Overall Result"
									}
								} ]
					}
				},
				{
					"row" : {
						"rowidx" : "3",
						"cells" : [
								{
									"control" : {
										"type" : "xcell",
										"id" : "CROSSTAB_1_ia_pt_2_0",
										"colidx" : 1,
										"style" : "TITLE",
										"sort" : "ASC",
										"sortalternativetext" : "Ascending",
										"sorttooltip" : "Sort in Descending Order",
										"sortaction" : "sapbi_page.sendCommandArray([['BI_COMMAND',null,0,[['GUID','19',0],['BI_COMMAND_TYPE','ABSTRACT',0]]]]);",
										"_v" : "Calendar Year/Month"
									}
								},
								{
									"control" : {
										"type" : "xcell",
										"id" : "CROSSTAB_1_ia_pt_2_1",
										"colidx" : 2,
										"style" : "TITLE",
										"sort" : "ASC",
										"sortalternativetext" : "Ascending",
										"sorttooltip" : "Sort in Descending Order",
										"sortaction" : "sapbi_page.sendCommandArray([['BI_COMMAND',null,0,[['GUID','20',0],['BI_COMMAND_TYPE','ABSTRACT',0]]]]);",
										"_v" : "Product"
									}
								}, {
									"control" : {
										"type" : "xcell",
										"id" : "CROSSTAB_1_ia_pt_2_2",
										"colidx" : 3,
										"style" : "HEADER",
										"_v" : "* 1,000 $"
									}
								}, {
									"control" : {
										"type" : "xcell",
										"id" : "CROSSTAB_1_ia_pt_2_3",
										"colidx" : 4,
										"style" : "HEADER",
										"_v" : "* 1,000 $"
									}
								}, {
									"control" : {
										"type" : "xcell",
										"id" : "CROSSTAB_1_ia_pt_2_4",
										"colidx" : 5,
										"style" : "TOTAL",
										"_v" : "* 1,000 $"
									}
								} ]
					}
				}, {
					"row" : {
						"rowidx" : "4",
						"cells" : [ {
							"control" : {
								"type" : "xcell",
								"id" : "CROSSTAB_1_ia_pt_3_0",
								"rowspan" : 3,
								"colidx" : 1,
								"key" : "200302",
								"style" : "HEADER",
								"_v" : "FEB 2003"
							}
						}, {
							"control" : {
								"type" : "xcell",
								"id" : "CROSSTAB_1_ia_pt_3_1",
								"colidx" : 2,
								"key" : "200302/PDS10",
								"style" : "HEADER",
								"_v" : "USB MegaStorage"
							}
						}, {
							"control" : {
								"type" : "xcell",
								"id" : "CROSSTAB_1_ia_pt_3_2",
								"colidx" : 3,
								"style" : "ALTERNATING",
								"_v" : "19,704"
							}
						}, {
							"control" : {
								"type" : "xcell",
								"id" : "CROSSTAB_1_ia_pt_3_3",
								"colidx" : 4,
								"style" : "ALTERNATING",
								"_v" : ""
							}
						}, {
							"control" : {
								"type" : "xcell",
								"id" : "CROSSTAB_1_ia_pt_3_4",
								"colidx" : 5,
								"style" : "TOTAL",
								"_v" : "19,704"
							}
						} ]
					}
				}, {
					"row" : {
						"rowidx" : "5",
						"cells" : [ {
							"control" : {
								"type" : "xcell",
								"id" : "CROSSTAB_1_ia_pt_4_1",
								"colidx" : 2,
								"key" : "200302/PDS08",
								"style" : "HEADER",
								"_v" : "USB Storage"
							}
						}, {
							"control" : {
								"type" : "xcell",
								"id" : "CROSSTAB_1_ia_pt_4_2",
								"colidx" : 3,
								"_v" : "21,752"
							}
						}, {
							"control" : {
								"type" : "xcell",
								"id" : "CROSSTAB_1_ia_pt_4_3",
								"colidx" : 4,
								"_v" : ""
							}
						}, {
							"control" : {
								"type" : "xcell",
								"id" : "CROSSTAB_1_ia_pt_4_4",
								"colidx" : 5,
								"style" : "TOTAL",
								"_v" : "21,752"
							}
						} ]
					}
				}, {
					"row" : {
						"rowidx" : "6",
						"cells" : [ {
							"control" : {
								"type" : "xcell",
								"id" : "CROSSTAB_1_ia_pt_5_1",
								"colidx" : 2,
								"key" : "200302/SUMME",
								"style" : "TOTAL",
								"_v" : "Result"
							}
						}, {
							"control" : {
								"type" : "xcell",
								"id" : "CROSSTAB_1_ia_pt_5_2",
								"colidx" : 3,
								"style" : "TOTAL",
								"_v" : "88,364"
							}
						}, {
							"control" : {
								"type" : "xcell",
								"id" : "CROSSTAB_1_ia_pt_5_3",
								"colidx" : 4,
								"style" : "TOTAL",
								"_v" : "89,968"
							}
						}, {
							"control" : {
								"type" : "xcell",
								"id" : "CROSSTAB_1_ia_pt_5_4",
								"colidx" : 5,
								"style" : "TOTAL",
								"_v" : "178,332"
							}
						} ]
					}
				} ]
	}
};