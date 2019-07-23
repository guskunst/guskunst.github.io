// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/* global sinaDefine */
sinaDefine([], function () {
    "use strict";
    return function (oContext, gen) {
        var res = {};
        res.alligator = [
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'SALARY',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Salary',
                value: '5123',
                valueFormatted: '5123.00',
                metadata: gen.getMetadataById(gen.metadata, "SALARY"),
                unitOfMeasure: oContext.sina._createSearchResultSetItemAttribute({
                    id: 'CURRENCY',
                    valueHighlighted: '',
                    isHighlighted: false,
                    label: 'Currency',
                    value: 'Euro',
                    valueFormatted: '€',
                    metadata: gen.getMetadataById(gen.metadata, "CURRENCY")
                })
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'HEIGHT',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Height',
                value: '169',
                valueFormatted: '169',
                metadata: gen.getMetadataById(gen.metadata, "HEIGHT"),
                unitOfMeasure: oContext.sina._createSearchResultSetItemAttribute({
                    id: 'UOM_HEIGHT',
                    valueHighlighted: '',
                    isHighlighted: false,
                    label: 'Unit of Measure for Height',
                    value: 'cm',
                    valueFormatted: 'cm',
                    metadata: gen.getMetadataById(gen.metadata, "UOM_HEIGHT")
                })
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'DESC',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Quote',
                value: 'Robert Daley\'s "The World Beneath The City" (1959), a history of the problems involved in developing the network of utilities beneath Manhattan island, reports that sewer inspectors first saw aligators in 1935, and confirms that their average length was about 2 feet. ',
                valueFormatted: 'Robert Daley\'s "The World Beneath The City" (1959), a history of the problems involved in developing the network of utilities beneath Manhattan island, reports that sewer inspectors first saw aligators in 1935, and confirms that their average length was about 2 feet. ',
                metadata: gen.getMetadataById(gen.metadata2, "DESC")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'LOCATION',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Location',
                value: 'NYC',
                valueFormatted: 'NYC',
                metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'sightinglocation',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'New York City',
                value: '{ "type": "Point", "coordinates": [-91.132139, -0.828628] }',
                valueFormatted: '{ "type": "Point", "coordinates": [-91.132139, -0.828628] }',
                metadata: gen.getMetadataById(gen.metadata2, "LOC_4326")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'FOLKLORIST',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Folklorist',
                value: 'George Fergus',
                valueFormatted: 'George Fergus',
                metadata: gen.getMetadataById(gen.metadata2, "FOLKLORIST")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'PIC',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Picture',
                value: '/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/alligator.jpg',
                valueFormatted: '/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/alligator.jpg',
                metadata: gen.getMetadataById(gen.metadata2, "PIC")
            })
        ];

        res.slenderman = [
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'SALARY',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Salary',
                value: '4300',
                valueFormatted: '4300.00',
                metadata: gen.getMetadataById(gen.metadata, "SALARY"),
                unitOfMeasure: oContext.sina._createSearchResultSetItemAttribute({
                    id: 'CURRENCY',
                    valueHighlighted: '',
                    isHighlighted: false,
                    label: 'Currency',
                    value: 'Euro',
                    valueFormatted: '€',
                    metadata: gen.getMetadataById(gen.metadata, "CURRENCY")
                })
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'HEIGHT',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Height',
                value: '171',
                valueFormatted: '171',
                metadata: gen.getMetadataById(gen.metadata, "HEIGHT"),
                unitOfMeasure: oContext.sina._createSearchResultSetItemAttribute({
                    id: 'UOM_HEIGHT',
                    valueHighlighted: '',
                    isHighlighted: false,
                    label: 'Unit of Measure for Height',
                    value: 'cm',
                    valueFormatted: 'cm',
                    metadata: gen.getMetadataById(gen.metadata, "UOM_HEIGHT")
                })
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'LOCATION',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Location',
                value: 'University of Georgia',
                valueFormatted: 'University of Georgia',
                metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
            }),

            oContext.sina._createSearchResultSetItemAttribute({
                id: 'FOLKLORIST',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Folklorist',
                value: 'Shira Chess',
                valueFormatted: 'Shira Chess',
                metadata: gen.getMetadataById(gen.metadata2, "FOLKLORIST")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'sightinglocation',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'University of Georgia',
                value: '{ "type": "Point", "coordinates": [35.102514, 34.824097] }',
                valueFormatted: '{ "type": "Point", "coordinates": [35.102514, 34.824097] }',
                metadata: gen.getMetadataById(gen.metadata2, "LOC_4326")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'DESC',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Summary',
                value: 'Slender Man is a fictional character that originated as an Internet meme created by Something Awful forums user Victor Surge in 2009, depicted as a thin, unnaturally tall man with a blank and usually featureless face and wearing a black suit, commonly said to stalk, abduct, or traumatize people, particularly children.',
                valueFormatted: 'Slender Man is a fictional character that originated as an Internet meme created by Something Awful forums user Victor Surge in 2009, depicted as a thin, unnaturally tall man with a blank and usually featureless face and wearing a black suit, commonly said to stalk, abduct, or traumatize people, particularly children.',
                metadata: gen.getMetadataById(gen.metadata2, "DESC")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'PIC',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Picture',
                value: '/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/slender_man.jpg',
                valueFormatted: '/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/slender_man.jpg',
                metadata: gen.getMetadataById(gen.metadata2, "PIC")
            })
        ];

        res.chupacabra = [
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'LOCATION',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Location',
                value: 'Puerto Rico',
                valueFormatted: 'Puerto Rico',
                metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
            }),

            oContext.sina._createSearchResultSetItemAttribute({
                id: 'FOLKLORIST',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Folklorist',
                value: 'Benjamin Radford',
                valueFormatted: 'Benjamin Radford',
                metadata: gen.getMetadataById(gen.metadata2, "FOLKLORIST")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'sightinglocation',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Chupacabra, sighting, Puerto Rico',
                value: '{ "type": "Point", "coordinates": [36.199993, 33.999453] }',
                valueFormatted: '{ "type": "Point", "coordinates": [36.199993, 33.999453] }',
                metadata: gen.getMetadataById(gen.metadata2, "LOC_4326")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'DESC',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Summary',
                value: ' The first purported sightings were reported in Puerto Rico. The name comes from the animal\'s reported habit of attacking and drinking the blood of livestock, including goats.',
                valueFormatted: ' The first purported sightings were reported in Puerto Rico. The name comes from the animal\'s reported habit of attacking and drinking the blood of livestock, including goats.',
                metadata: gen.getMetadataById(gen.metadata2, "DESC")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'PIC',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Picture',
                value: '/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/chupacabra.jpg',
                valueFormatted: '/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/chupacabra.jpg',
                metadata: gen.getMetadataById(gen.metadata2, "PIC")
            })
        ];

        res.hitchhiker = [oContext.sina._createSearchResultSetItemAttribute({
                id: 'LOCATION',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Location',
                value: 'University of California, Berkeley',
                valueFormatted: 'University of California, Berkeley',
                metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
            }),

            oContext.sina._createSearchResultSetItemAttribute({
                id: 'FOLKLORIST',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Folklorist',
                value: 'Rosalie Hankey',
                valueFormatted: 'Rosalie Hankey',
                metadata: gen.getMetadataById(gen.metadata2, "FOLKLORIST")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'sightinglocation',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'University of California, Berkeley',
                value: '{ "type": "Point", "coordinates": [36.204944, 34.006899] }',
                valueFormatted: '{ "type": "Point", "coordinates": [36.204944, 34.006899] }',
                metadata: gen.getMetadataById(gen.metadata2, "LOC_4326")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'DESC',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Summary',
                value: 'People traveling by vehicle meet with or are accompanied by a hitchhiker who subsequently vanishes without explanation, often from a moving vehicle. The vanishing hitchhiker can also leave some form of information that encourages the motorist to make subsequent contact.',
                valueFormatted: 'People traveling by vehicle meet with or are accompanied by a hitchhiker who subsequently vanishes without explanation, often from a moving vehicle. The vanishing hitchhiker can also leave some form of information that encourages the motorist to make subsequent contact.',
                metadata: gen.getMetadataById(gen.metadata2, "DESC")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'PIC',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Picture',
                value: '/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/hitchhiker.jpg',
                valueFormatted: '/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/hitchhiker.jpg',
                metadata: gen.getMetadataById(gen.metadata2, "PIC")
            })
        ];

        res.hitchhiker2 = [oContext.sina._createSearchResultSetItemAttribute({
                id: 'LOCATION',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Location',
                value: 'Cripple Creek, Colorado',
                valueFormatted: 'Cripple Creek, Colorado',
                metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'FOLKLORIST',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Folklorist',
                value: 'Richard Beardsley',
                valueFormatted: 'Richard Beardsley',
                metadata: gen.getMetadataById(gen.metadata2, "FOLKLORIST")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'sightinglocation',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Wycliffe Well, NT, Australia',
                value: '{ "type": "Point", "coordinates": [134.236761, -20.795279] }',
                valueFormatted: '{ "type": "Point", "coordinates": [134.236761, -20.795279] }',
                metadata: gen.getMetadataById(gen.metadata2, "LOC_4326")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'DESC',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Summary',
                value: 'Public knowledge of the story expanded greatly with the 1981 publication of Jan Harold Brunvand\'s book The Vanishing Hitchhiker. Brunvand suggests that the story can be traced as far back as the 1870s and has "recognizable parallels in Korea, Tsarist Russia, among Chinese-Americans, Mormons, and Ozark mountaineers".',
                valueFormatted: 'Public knowledge of the story expanded greatly with the 1981 publication of Jan Harold Brunvand\'s book The Vanishing Hitchhiker. Brunvand suggests that the story can be traced as far back as the 1870s and has "recognizable parallels in Korea, Tsarist Russia, among Chinese-Americans, Mormons, and Ozark mountaineers".',
                metadata: gen.getMetadataById(gen.metadata2, "DESC")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'PIC',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Picture',
                value: '/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/vanishing.jpg',
                valueFormatted: '/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/vanishing.jpg',
                metadata: gen.getMetadataById(gen.metadata2, "PIC")
            })
        ];

        res.babytrain = [oContext.sina._createSearchResultSetItemAttribute({
                id: 'LOCATION',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Location',
                value: 'A small town',
                valueFormatted: 'A small town',
                metadata: gen.getMetadataById(gen.metadata2, "LOCATION")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'FOLKLORIST',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Folklorist',
                value: 'Bill Scott',
                valueFormatted: 'Bill Scott',
                metadata: gen.getMetadataById(gen.metadata2, "FOLKLORIST")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'sightinglocation',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'a little town on the coast, not too far north of Sydney',
                value: '{ "type": "Point", "coordinates": [38.855842, 37.217718] }',
                valueFormatted: '{ "type": "Point", "coordinates": [38.855842, 37.217718] }',
                metadata: gen.getMetadataById(gen.metadata2, "LOC_4326")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'DESC',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Summary',
                value: 'a small town had an unusually high birth rate because a train would pass through the town at 5:00 am and blow its whistle, waking up all the residents. Since it was too late to go back to sleep and too early to get up, couples would find other ways to amuse themselves in bed. This resulted in the mini-baby boom.',
                valueFormatted: 'a small town had an unusually high birth rate because a train would pass through the town at 5:00 am and blow its whistle, waking up all the residents. Since it was too late to go back to sleep and too early to get up, couples would find other ways to amuse themselves in bed. This resulted in the mini-baby boom.',
                metadata: gen.getMetadataById(gen.metadata2, "FOLKLORIST")
            }),
            oContext.sina._createSearchResultSetItemAttribute({
                id: 'PIC',
                valueHighlighted: '',
                isHighlighted: false,
                label: 'Picture',
                value: '/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/babytrain.jpg',
                valueFormatted: '/sap/bc/ui5_ui5/ui2/ushell/resources/sap/ushell/renderers/fiori2/search/sinaNext/providers/sample/images/babytrain.jpg',
                metadata: gen.getMetadataById(gen.metadata2, "PIC")
            })
        ];

        return res;
    };
});
