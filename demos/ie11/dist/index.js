(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('@hpcc-js/phosphor'), require('@hpcc-js/graph'), require('@hpcc-js/common'), require('@hpcc-js/react'), require('@hpcc-js/dgrid'), require('@hpcc-js/codemirror'), require('@hpcc-js/util')) :
    typeof define === 'function' && define.amd ? define(['@hpcc-js/phosphor', '@hpcc-js/graph', '@hpcc-js/common', '@hpcc-js/react', '@hpcc-js/dgrid', '@hpcc-js/codemirror', '@hpcc-js/util'], factory) :
    (global = global || self, factory(global['@hpcc-js/phosphor'], global['@hpcc-js/graph'], global['@hpcc-js/common'], global['@hpcc-js/react'], global['@hpcc-js/dgrid'], global['@hpcc-js/codemirror'], global['@hpcc-js/util']));
}(this, (function (phosphor, graph, common, react, dgrid, codemirror, util) {
    const CustomVertex = ({ categoryID = "", text = "", textHeight = 10, textPadding = 4, icon = {}, annotationsHeight = 12, annotationIDs = [], textFill = "#287EC4", textboxFill = "white", textboxStroke = "#CCCCCC", textFontFamily = "Verdana", showLabel = true, origData = {} }) => {
        var _a, _b, _c, _d;
        const textboxStrokeWidth = 1;
        const cornerRadius = 3;
        const noLabelRadius = 5;
        icon = {
            height: 50,
            imageChar: "?",
            imageFontFamily: "FontAwesome",
            imageCharFill: "#555555",
            fill: "transparent",
            strokeWidth: 0,
            ...icon
        };
        const subText = react.React.useMemo(() => {
            var _a, _b, _c, _d, _e, _f, _g;
            return {
                text: "" + (((_c = (_b = (_a = origData === null || origData === void 0 ? void 0 : origData.payload) === null || _a === void 0 ? void 0 : _a.neighbors) === null || _b === void 0 ? void 0 : _b.company) !== null && _c !== void 0 ? _c : 0) + ((_f = (_e = (_d = origData === null || origData === void 0 ? void 0 : origData.payload) === null || _d === void 0 ? void 0 : _d.neighbors) === null || _e === void 0 ? void 0 : _e.person) !== null && _f !== void 0 ? _f : 0) - ((_g = origData === null || origData === void 0 ? void 0 : origData.neighborCount) !== null && _g !== void 0 ? _g : 0)),
                fill: "white",
                textFill: "#555555"
            };
        }, [origData === null || origData === void 0 ? void 0 : origData.neighborCount, (_b = (_a = origData === null || origData === void 0 ? void 0 : origData.payload) === null || _a === void 0 ? void 0 : _a.neighbors) === null || _b === void 0 ? void 0 : _b.company, (_d = (_c = origData === null || origData === void 0 ? void 0 : origData.payload) === null || _c === void 0 ? void 0 : _c.neighbors) === null || _d === void 0 ? void 0 : _d.person]);
        let fullAnnotationWidth = 0;
        const annoOffsetY = 0;
        const labelWidth = react.React.useMemo(() => {
            return common.Utility.textSize(text, textFontFamily, textHeight, false).width;
        }, [text, textFontFamily, textHeight]);
        let labelShapeWidth = 0;
        if (text !== "") {
            labelShapeWidth = labelWidth + (textPadding * 2) + (textboxStrokeWidth * 2);
        }
        fullAnnotationWidth += labelShapeWidth;
        const textOffsetX = fullAnnotationWidth - (labelShapeWidth / 2);
        const textShapeHeight = textHeight + (textPadding * 2) + (textboxStrokeWidth * 2);
        const textElement = react.React.useMemo(() => {
            return react.React.createElement("g", { transform: `translate(${textOffsetX} ${annoOffsetY})` }, !showLabel || text === "" ?
                react.React.createElement("circle", { r: noLabelRadius, stroke: textboxStroke, fill: textFill }) :
                react.React.createElement(react.React.Fragment, null,
                    react.React.createElement(react.TextBox, { text: text, height: textHeight, padding: textPadding, strokeWidth: textboxStrokeWidth, stroke: textboxStroke, fill: textboxFill, textFill: textFill, fontFamily: textFontFamily, cornerRadius: cornerRadius })));
        }, [showLabel, text, textFill, textFontFamily, textHeight, textOffsetX, textPadding, textboxFill, textboxStroke]);
        const iconHeight = icon.height || 20;
        const iconStrokeWidth = icon.strokeWidth || 0;
        const iconOffsetX = 0;
        let iconOffsetY = 0;
        const subTextOffsetX = 0;
        let subTextOffsetY = textShapeHeight;
        if (text !== "") {
            iconOffsetY = -(iconHeight / 2) - (iconStrokeWidth) - (textShapeHeight / 2);
        }
        else if (subText.text !== "") {
            subTextOffsetY = (iconHeight / 2) + iconStrokeWidth;
        }
        const subtextElement = react.React.useMemo(() => subText.text === "" ? null :
            react.React.createElement("g", { transform: `translate(${subTextOffsetX} ${subTextOffsetY})` },
                react.React.createElement(react.TextBox, { fill: subText.fill || "#FFFFFF", textFill: subText.textFill || textFill, ...subText, height: textHeight, padding: textPadding, strokeWidth: 0, stroke: textboxStroke, fontFamily: textFontFamily, cornerRadius: cornerRadius })), [subText, subTextOffsetY, textFill, textFontFamily, textHeight, textPadding, textboxStroke]);
        return react.React.createElement("g", null,
            react.React.createElement("g", { transform: `translate(${iconOffsetX} ${iconOffsetY})` },
                react.React.createElement(react.Icon, { ...icon })),
            react.React.createElement("g", { transform: `translate(${-fullAnnotationWidth / 2} ${annoOffsetY})` }, textElement),
            subtextElement);
    };
    const CustomCentroidVertex = function ({ categoryID = "", text = "", icon = {}, annotationsHeight = 12, annotationIDs = [], textHeight = 12, textPadding = 10, textFill = "#287EC4", textboxFill = "white", textboxStroke = "#CCCCCC", textFontFamily = "Verdana", origData = {} }) {
        icon = {
            height: 91,
            padding: 40,
            imageCharFill: "#555555",
            imageFontFamily: "FontAwesome",
            fill: "#FFCC33",
            stroke: "#DFDFDF",
            imageChar: "?",
            strokeWidth: 4,
            yOffset: -15,
            ...icon
        };
        const props = {
            categoryID,
            text,
            icon,
            annotationsHeight,
            annotationIDs,
            textHeight,
            textPadding,
            textFill,
            textboxFill,
            textboxStroke,
            textFontFamily,
            origData
        };
        return react.React.createElement(CustomVertex, { ...props, icon: icon });
    };

    const typeFAChar = (type) => {
        switch (type) {
            case "company":
                return "fa-industry";
            case "person":
                return "fa-user";
        }
        return "?";
    };
    function values(obj) {
        return Object.keys(obj).map(key => obj[key]);
    }
    function merge(items1, items2) {
        const vIdx = {};
        for (const v of [...items1, ...items2]) {
            vIdx[v.id] = v;
        }
        return values(vIdx);
    }
    class MainGraph extends graph.DataGraph {
        constructor() {
            super();
            this
                .vertexColumns(["fachar", "id", "name", "centroid", "neighborCount", "tooltip", "payload"])
                .vertexFACharColumn("fachar")
                .vertexIDColumn("id")
                .vertexLabelColumn("name")
                .vertexCentroidColumn("centroid")
                .vertexRenderer(CustomVertex)
                .centroidRenderer(CustomCentroidVertex)
                .edgeColumns(["id", "sourceID", "targetID", "weight", "tooltip", "payload"])
                .edgeIDColumn("id")
                .edgeSourceColumn("sourceID")
                .edgeTargetColumn("targetID")
                .edgeLabelColumn("weight")
                .edgeArcDepth(10)
                .showToolbar(true)
                .layout("ForceDirectedHybrid")
                .treeRankDirection("TB")
                .highlightSelectedPathToCentroid(true)
                .applyScaleOnLayout(false)
                .allowDragging(true)
                .wasmFolder("https://raw.githack.com/Gordonsmith/Visualization/IE_11/demos/ie11/dist/");
        }
        mapVertex(v, edges) {
            return [typeFAChar(v.type), v.id, v.name, v.centroid, edges.filter(e => e.sourceID === v.id || e.targetID === v.id).length, "", v];
        }
        mapEdge(e) {
            return [e.id, e.sourceID, e.targetID, e.weight, "", e];
        }
        loadData(vertices, edges) {
            this.vertices(vertices.map(v => this.mapVertex(v, edges)));
            this.edges(edges.map(e => this.mapEdge(e)));
            return this;
        }
        mergeData(vertices, edges) {
            const merged_vertices = merge(this.vertices().map(v => v[v.length - 1]), vertices);
            const merged_edges = merge(this.edges().map(e => e[e.length - 1]), edges);
            this.loadData(merged_vertices, merged_edges);
            return this;
        }
    }
    class MainSankey extends graph.SankeyGraph {
        constructor() {
            super();
            this
                .vertexColumns(["type", "id", "name", "payload"])
                .vertexIDColumn("id")
                .vertexLabelColumn("name")
                .vertexCategoryColumn("type")
                .edgeColumns(["id", "sourceID", "targetID", "weight", "payload"])
                .edgeIDColumn("id")
                //  Reversed  ---
                .edgeSourceColumn("sourceID")
                .edgeTargetColumn("targetID")
                .edgeWeightColumn("weight")
                .vertexPadding(10);
        }
        loadData(vertices, edges) {
            this.vertices(vertices.map(row => [row.type, row.id, row.name, row]));
            this.edges(edges.map(row => [row.id, row.sourceID, row.targetID, row.weight, row]));
            return this;
        }
        mergeData(vertices, edges) {
            const merged_vertices = merge(this.vertices().map(v => v[v.length - 1]), vertices);
            const merged_edges = merge(this.edges().map(e => e[e.length - 1]), edges);
            this.loadData(merged_vertices, merged_edges);
            return this;
        }
    }

    class CompanyTable extends dgrid.Table {
        constructor() {
            super();
            this.columns(["Name", "Duns", { label: "Address", columns: ["Country", "Locality", "Region", "PostalCode"] }, "Direct Ownership", "Implied Ownership"]);
        }
        loadData(data) {
            this.data(data);
            return this;
        }
    }
    class PersonTable extends dgrid.Table {
        constructor() {
            super();
            this.columns(["Name", { label: "Address", columns: ["Country", "Locality", "Region", "PostalCode"] }, "Direct Ownership", "Implied Ownership"]);
        }
        loadData(data) {
            this.data(data);
            return this;
        }
    }

    class DataEditor extends codemirror.JSONEditor {
        constructor() {
            super();
        }
    }

    var inquiryDetail = {
    	duns: "315369934",
    	ownershipType: "BENF_OWRP",
    	productID: "cmpbos",
    	productVersion: "v1"
    };
    var organization = {
    	address: {
    		addressCountry: {
    			isoAlpha2Code: "DE",
    			name: "Germany"
    		},
    		addressCounty: {
    			name: "Bayern"
    		},
    		addressLocality: {
    			name: "München"
    		},
    		addressRegion: null,
    		postalCode: "80788",
    		streetAddress: {
    			line1: "Petuelring 130",
    			line2: null,
    			line3: null
    		}
    	},
    	beneficialOwnership: {
    		beneficialOwners: [
    			{
    				address: {
    					addressCountry: {
    						isoAlpha2Code: "DE",
    						name: "Germany"
    					},
    					addressLocality: {
    						name: "München"
    					},
    					addressRegion: null,
    					postalCode: "80788",
    					streetAddress: {
    						line1: "Petuelring 130",
    						line2: null,
    						line3: null
    					}
    				},
    				appliedControlType: [
    				],
    				beneficialOwnershipPercentage: null,
    				beneficiaryType: {
    					description: "Business",
    					dnbCode: 118
    				},
    				birthDate: null,
    				businessEntityType: {
    					description: "Public Limited Liability Company (DE)",
    					dnbCode: 7114
    				},
    				controlOwnershipType: {
    					confidenceLevel: null,
    					description: "Publicly Traded Company",
    					dnbCode: 9057
    				},
    				degreeOfSeparation: 0,
    				directOwnershipPercentage: null,
    				duns: "315369934",
    				impliedBeneficialOwnershipPercentage: null,
    				impliedDirectOwnershipPercentage: null,
    				impliedIndirectOwnershipPercentage: null,
    				indirectOwnershipPercentage: null,
    				isBeneficiary: false,
    				isFilteredOut: null,
    				isOutofBusiness: false,
    				legalAuthority: null,
    				legalForm: null,
    				memberID: 197241775,
    				name: "Bayerische Motoren Werke Aktiengesellschaft",
    				nationality: null,
    				ownershipUnavailableReasons: [
    				],
    				personId: null,
    				residenceCountryName: null
    			},
    			{
    				address: null,
    				appliedControlType: [
    				],
    				beneficialOwnershipPercentage: 53.63,
    				beneficiaryType: null,
    				birthDate: null,
    				businessEntityType: null,
    				controlOwnershipType: null,
    				degreeOfSeparation: 1,
    				directOwnershipPercentage: 53.63,
    				duns: null,
    				impliedBeneficialOwnershipPercentage: null,
    				impliedDirectOwnershipPercentage: null,
    				impliedIndirectOwnershipPercentage: null,
    				indirectOwnershipPercentage: null,
    				isBeneficiary: true,
    				isFilteredOut: false,
    				isOutofBusiness: null,
    				legalAuthority: null,
    				legalForm: null,
    				memberID: 670061343,
    				name: "Streubesitz",
    				nationality: null,
    				ownershipUnavailableReasons: [
    				],
    				personId: null,
    				residenceCountryName: null
    			},
    			{
    				address: {
    					addressCountry: {
    						isoAlpha2Code: "DE",
    						name: "Germany"
    					},
    					addressLocality: {
    						name: "Bad Homburg"
    					},
    					addressRegion: null,
    					postalCode: "61352",
    					streetAddress: {
    						line1: "Seedammweg 55",
    						line2: null,
    						line3: null
    					}
    				},
    				appliedControlType: [
    				],
    				beneficialOwnershipPercentage: null,
    				beneficiaryType: {
    					description: "Business",
    					dnbCode: 118
    				},
    				birthDate: null,
    				businessEntityType: {
    					description: "European Company",
    					dnbCode: 13142
    				},
    				controlOwnershipType: null,
    				degreeOfSeparation: 1,
    				directOwnershipPercentage: 9.02,
    				duns: "340907483",
    				impliedBeneficialOwnershipPercentage: null,
    				impliedDirectOwnershipPercentage: 9.02,
    				impliedIndirectOwnershipPercentage: null,
    				indirectOwnershipPercentage: null,
    				isBeneficiary: false,
    				isFilteredOut: true,
    				isOutofBusiness: false,
    				legalAuthority: null,
    				legalForm: null,
    				memberID: 196342144,
    				name: "AQTON SE",
    				nationality: null,
    				ownershipUnavailableReasons: [
    				],
    				personId: null,
    				residenceCountryName: null
    			},
    			{
    				address: {
    					addressCountry: {
    						isoAlpha2Code: "DE",
    						name: "Germany"
    					},
    					addressLocality: {
    						name: "Bad Homburg"
    					},
    					addressRegion: null,
    					postalCode: "61352",
    					streetAddress: {
    						line1: "Seedammweg 55",
    						line2: null,
    						line3: null
    					}
    				},
    				appliedControlType: [
    				],
    				beneficialOwnershipPercentage: null,
    				beneficiaryType: {
    					description: "Business",
    					dnbCode: 118
    				},
    				birthDate: null,
    				businessEntityType: {
    					description: "Private Limited Liability Company (DE)",
    					dnbCode: 7113
    				},
    				controlOwnershipType: {
    					confidenceLevel: null,
    					description: "Privately owned",
    					dnbCode: 9058
    				},
    				degreeOfSeparation: 1,
    				directOwnershipPercentage: 20.74,
    				duns: "537754488",
    				impliedBeneficialOwnershipPercentage: null,
    				impliedDirectOwnershipPercentage: null,
    				impliedIndirectOwnershipPercentage: null,
    				indirectOwnershipPercentage: null,
    				isBeneficiary: false,
    				isFilteredOut: true,
    				isOutofBusiness: false,
    				legalAuthority: null,
    				legalForm: null,
    				memberID: 65750480,
    				name: "Susanne Klatten Beteiligungs GmbH",
    				nationality: null,
    				ownershipUnavailableReasons: [
    				],
    				personId: null,
    				residenceCountryName: null
    			},
    			{
    				address: {
    					addressCountry: {
    						isoAlpha2Code: "DE",
    						name: "Germany"
    					},
    					addressLocality: {
    						name: "Bad Homburg"
    					},
    					addressRegion: null,
    					postalCode: "61352",
    					streetAddress: {
    						line1: "Seedammweg 55",
    						line2: null,
    						line3: null
    					}
    				},
    				appliedControlType: [
    				],
    				beneficialOwnershipPercentage: null,
    				beneficiaryType: {
    					description: "Business",
    					dnbCode: 118
    				},
    				birthDate: null,
    				businessEntityType: {
    					description: "Private Limited Liability Company and Limited Partnership (DE)",
    					dnbCode: 7118
    				},
    				controlOwnershipType: {
    					confidenceLevel: null,
    					description: "Privately owned",
    					dnbCode: 9058
    				},
    				degreeOfSeparation: 1,
    				directOwnershipPercentage: 16.61,
    				duns: "315761838",
    				impliedBeneficialOwnershipPercentage: null,
    				impliedDirectOwnershipPercentage: null,
    				impliedIndirectOwnershipPercentage: null,
    				indirectOwnershipPercentage: null,
    				isBeneficiary: false,
    				isFilteredOut: true,
    				isOutofBusiness: false,
    				legalAuthority: null,
    				legalForm: null,
    				memberID: 245769898,
    				name: "AQTON GmbH & Co.KG für Automobilwerte",
    				nationality: null,
    				ownershipUnavailableReasons: [
    				],
    				personId: null,
    				residenceCountryName: null
    			},
    			{
    				address: {
    					addressCountry: {
    						isoAlpha2Code: "DE",
    						name: "Germany"
    					},
    					addressLocality: {
    						name: "Bad Homburg"
    					},
    					addressRegion: null,
    					postalCode: "61352",
    					streetAddress: {
    						line1: "Seedammweg 55",
    						line2: null,
    						line3: null
    					}
    				},
    				appliedControlType: [
    					{
    						description: "Impacted Distribution",
    						dnbCode: 34784
    					}
    				],
    				beneficialOwnershipPercentage: 25.63,
    				beneficiaryType: {
    					description: "Individual",
    					dnbCode: 119
    				},
    				birthDate: "1966-05",
    				businessEntityType: null,
    				controlOwnershipType: null,
    				degreeOfSeparation: 2,
    				directOwnershipPercentage: null,
    				duns: null,
    				impliedBeneficialOwnershipPercentage: 25.63,
    				impliedDirectOwnershipPercentage: null,
    				impliedIndirectOwnershipPercentage: 9.02,
    				indirectOwnershipPercentage: 9.02,
    				isBeneficiary: true,
    				isFilteredOut: false,
    				isOutofBusiness: null,
    				legalAuthority: null,
    				legalForm: null,
    				memberID: 566565587,
    				name: "Stefan Quandt",
    				nationality: null,
    				ownershipUnavailableReasons: [
    				],
    				personId: null,
    				residenceCountryName: null
    			},
    			{
    				address: {
    					addressCountry: {
    						isoAlpha2Code: "DE",
    						name: "Germany"
    					},
    					addressLocality: {
    						name: "München"
    					},
    					addressRegion: null,
    					postalCode: "80538",
    					streetAddress: null
    				},
    				appliedControlType: [
    				],
    				beneficialOwnershipPercentage: 20.74,
    				beneficiaryType: {
    					description: "Individual",
    					dnbCode: 119
    				},
    				birthDate: "1962-04",
    				businessEntityType: null,
    				controlOwnershipType: null,
    				degreeOfSeparation: 2,
    				directOwnershipPercentage: null,
    				duns: null,
    				impliedBeneficialOwnershipPercentage: null,
    				impliedDirectOwnershipPercentage: null,
    				impliedIndirectOwnershipPercentage: null,
    				indirectOwnershipPercentage: 20.74,
    				isBeneficiary: true,
    				isFilteredOut: false,
    				isOutofBusiness: null,
    				legalAuthority: null,
    				legalForm: null,
    				memberID: 565640542,
    				name: "Susanne Klatten",
    				nationality: null,
    				ownershipUnavailableReasons: [
    				],
    				personId: null,
    				residenceCountryName: null
    			},
    			{
    				address: {
    					addressCountry: {
    						isoAlpha2Code: "DE",
    						name: "Germany"
    					},
    					addressLocality: {
    						name: "Bad Homburg"
    					},
    					addressRegion: null,
    					postalCode: "61352",
    					streetAddress: {
    						line1: "Seedammweg 55",
    						line2: null,
    						line3: null
    					}
    				},
    				appliedControlType: [
    					{
    						description: "Worst Case Distribution",
    						dnbCode: 34781
    					}
    				],
    				beneficialOwnershipPercentage: null,
    				beneficiaryType: {
    					description: "Business",
    					dnbCode: 118
    				},
    				birthDate: null,
    				businessEntityType: {
    					description: "Private Limited Liability Company (DE)",
    					dnbCode: 7113
    				},
    				controlOwnershipType: {
    					confidenceLevel: null,
    					description: "Privately owned",
    					dnbCode: 9058
    				},
    				degreeOfSeparation: 2,
    				directOwnershipPercentage: null,
    				duns: "340910244",
    				impliedBeneficialOwnershipPercentage: null,
    				impliedDirectOwnershipPercentage: null,
    				impliedIndirectOwnershipPercentage: null,
    				indirectOwnershipPercentage: null,
    				isBeneficiary: false,
    				isFilteredOut: true,
    				isOutofBusiness: false,
    				legalAuthority: null,
    				legalForm: null,
    				memberID: 199043930,
    				name: "AQTON Verwaltung GmbH",
    				nationality: null,
    				ownershipUnavailableReasons: [
    				],
    				personId: null,
    				residenceCountryName: null
    			}
    		],
    		relationships: [
    			{
    				impliedSharePercentage: null,
    				isFilteredOut: false,
    				natureOfControlStartDate: null,
    				natureOfControlType: [
    				],
    				natureofControlClass: [
    				],
    				relationshipID: 405733595,
    				relationshipType: {
    					description: "Owned Subject / Share Owner",
    					dnbCode: "137"
    				},
    				sharePercentage: 53.63,
    				sourceMemberID: 197241775,
    				targetMemberID: 670061343
    			},
    			{
    				impliedSharePercentage: null,
    				isFilteredOut: true,
    				natureOfControlStartDate: null,
    				natureOfControlType: [
    				],
    				natureofControlClass: [
    				],
    				relationshipID: 372504576,
    				relationshipType: {
    					description: "Owned Subject / Share Owner",
    					dnbCode: "137"
    				},
    				sharePercentage: 9.02,
    				sourceMemberID: 197241775,
    				targetMemberID: 196342144
    			},
    			{
    				impliedSharePercentage: null,
    				isFilteredOut: true,
    				natureOfControlStartDate: null,
    				natureOfControlType: [
    				],
    				natureofControlClass: [
    				],
    				relationshipID: 8955133,
    				relationshipType: {
    					description: "Owned Subject / Share Owner",
    					dnbCode: "137"
    				},
    				sharePercentage: 100,
    				sourceMemberID: 199043930,
    				targetMemberID: 196342144
    			},
    			{
    				impliedSharePercentage: null,
    				isFilteredOut: true,
    				natureOfControlStartDate: null,
    				natureOfControlType: [
    				],
    				natureofControlClass: [
    				],
    				relationshipID: 364614326,
    				relationshipType: {
    					description: "Owned Subject / Share Owner",
    					dnbCode: "137"
    				},
    				sharePercentage: 100,
    				sourceMemberID: 245769898,
    				targetMemberID: 196342144
    			},
    			{
    				impliedSharePercentage: null,
    				isFilteredOut: true,
    				natureOfControlStartDate: null,
    				natureOfControlType: [
    				],
    				natureofControlClass: [
    				],
    				relationshipID: 258272856,
    				relationshipType: {
    					description: "Owned Subject / Share Owner",
    					dnbCode: "137"
    				},
    				sharePercentage: 20.74,
    				sourceMemberID: 197241775,
    				targetMemberID: 65750480
    			},
    			{
    				impliedSharePercentage: null,
    				isFilteredOut: true,
    				natureOfControlStartDate: null,
    				natureOfControlType: [
    				],
    				natureofControlClass: [
    				],
    				relationshipID: 154079270,
    				relationshipType: {
    					description: "Owned Subject / Share Owner",
    					dnbCode: "137"
    				},
    				sharePercentage: 16.61,
    				sourceMemberID: 197241775,
    				targetMemberID: 245769898
    			},
    			{
    				impliedSharePercentage: null,
    				isFilteredOut: false,
    				natureOfControlStartDate: null,
    				natureOfControlType: [
    				],
    				natureofControlClass: [
    				],
    				relationshipID: 298711594,
    				relationshipType: {
    					description: "Owned Subject / Share Owner",
    					dnbCode: "137"
    				},
    				sharePercentage: 100,
    				sourceMemberID: 196342144,
    				targetMemberID: 566565587
    			},
    			{
    				impliedSharePercentage: null,
    				isFilteredOut: false,
    				natureOfControlStartDate: null,
    				natureOfControlType: [
    				],
    				natureofControlClass: [
    				],
    				relationshipID: 354559076,
    				relationshipType: {
    					description: "Owned Subject / Share Owner",
    					dnbCode: "137"
    				},
    				sharePercentage: 100,
    				sourceMemberID: 65750480,
    				targetMemberID: 565640542
    			},
    			{
    				impliedSharePercentage: 0,
    				isFilteredOut: true,
    				natureOfControlStartDate: null,
    				natureOfControlType: [
    				],
    				natureofControlClass: [
    				],
    				relationshipID: 126559954,
    				relationshipType: {
    					description: "Owned Subject / Share Owner",
    					dnbCode: "137"
    				},
    				sharePercentage: null,
    				sourceMemberID: 245769898,
    				targetMemberID: 199043930
    			}
    		]
    	},
    	beneficialOwnershipSummary: {
    		beneficialOwnersCount: 7,
    		corporateBeneficiariesCount: 0,
    		countryUnknownPSCCount: null,
    		countryWisePSCSummary: [
    		],
    		countryWiseSummary: [
    			{
    				beneficialOwnersCount: 6,
    				countryISOAlpha2Code: "DE"
    			}
    		],
    		governmentOrganizationsCount: 0,
    		impliedPercentageBeneficialOwnersCount: 2,
    		individualsCount: 2,
    		maximumDegreeOfSeparation: 2,
    		nationalityUnknownPSCCount: null,
    		nationalityWisePSCSummary: [
    		],
    		organizationsCount: 4,
    		privatelyHeldOrganizationsCount: 3,
    		pscCount: 0,
    		pscUniqueTypeCount: 0,
    		publiclyTradingOrganizationsCount: 0,
    		relationshipsCount: 9,
    		stateOwnedOrganizationsCount: 0,
    		totalAllocatedOwnershipPercentage: 100,
    		totalImpliedOwnershipPercentage: 25.63,
    		typeWisePSCSummary: [
    		],
    		unIdentifiedShareOwnersCount: 0,
    		unclassifedOwnersCount: 1
    	},
    	businessEntityType: {
    		description: "Public Limited Liability Company (DE)",
    		dnbCode: 7114
    	},
    	controlOwnershipType: {
    		confidenceLevel: null,
    		description: "Publicly Traded Company",
    		dnbCode: 9057
    	},
    	corporateLinkage: {
    		domesticUltimate: {
    			duns: "315369934",
    			primaryName: "Bayerische Motoren Werke Aktiengesellschaft"
    		},
    		globalUltimate: {
    			duns: "315369934",
    			primaryName: "Bayerische Motoren Werke Aktiengesellschaft"
    		},
    		parent: null
    	},
    	duns: "315369934",
    	dunsControlStatus: {
    		isOutOfBusiness: false
    	},
    	ownershipUnavailableReasons: [
    	],
    	primaryIndustryCode: null,
    	primaryName: "Bayerische Motoren Werke Aktiengesellschaft",
    	pscUnavailableReasons: [
    	]
    };
    var transactionDetail = {
    	inLanguage: "en-US",
    	productID: "cmpbos",
    	productVersion: "v1",
    	transactionID: "rrt-09ca07d4c5d500ae0-d-ea-31975-98411325-33",
    	transactionTimestamp: "2021-09-28T20:38:03.172Z"
    };
    var devData = {
    	inquiryDetail: inquiryDetail,
    	organization: organization,
    	transactionDetail: transactionDetail
    };

    class GraphContainer extends util.Graph2 {
        constructor() {
            super();
            this
                .idFunc(d => d.id)
                .sourceFunc(d => d.sourceID)
                .targetFunc(d => d.targetID);
        }
    }
    class GraphDB {
        constructor() {
            this._centroids = [];
            this._graph = new GraphContainer();
        }
        load(rawData) {
            var _a, _b, _c, _d, _e, _f;
            this._graph.clear();
            (_c = (_b = (_a = rawData === null || rawData === void 0 ? void 0 : rawData.organization) === null || _a === void 0 ? void 0 : _a.beneficialOwnership) === null || _b === void 0 ? void 0 : _b.beneficialOwners) === null || _c === void 0 ? void 0 : _c.forEach(row => {
                this._graph.addVertex({
                    type: !!row.duns ? "company" : "person",
                    id: row.memberID,
                    name: row.name,
                    centroid: row.duns === rawData.inquiryDetail.duns,
                    payload: row
                });
            });
            (_f = (_e = (_d = rawData === null || rawData === void 0 ? void 0 : rawData.organization) === null || _d === void 0 ? void 0 : _d.beneficialOwnership) === null || _e === void 0 ? void 0 : _e.relationships) === null || _f === void 0 ? void 0 : _f.forEach(row => {
                var _a;
                this._graph.addEdge({
                    type: "relationship",
                    id: row.relationshipID,
                    sourceID: row.sourceMemberID,
                    targetID: row.targetMemberID,
                    weight: (_a = row.sharePercentage) !== null && _a !== void 0 ? _a : 0,
                    payload: row
                });
            });
            this.updateNeighbors();
            return this;
        }
        subgraph(memberID, depth = 1) {
            const retVal = new GraphContainer();
            const vertices = this._graph.vertices();
            const edges = this._graph.edges();
            const roots = memberID ? vertices.filter(row => row.id === memberID) : vertices.filter(row => row.centroid);
            roots.forEach(root => {
                retVal.addVertex(root);
                let queue = [root];
                let level = 0;
                while (queue.length && level < depth) {
                    const nextLevel = [];
                    queue.forEach(v => {
                        edges.forEach(e => {
                            let target;
                            if (e.sourceID === v.id) {
                                target = this._graph.vertex(e.targetID);
                            }
                            else if (e.targetID === v.id) {
                                target = this._graph.vertex(e.sourceID);
                            }
                            if (target) {
                                if (!retVal.vertexExists(target.id)) {
                                    retVal.addVertex(target);
                                    nextLevel.push(target);
                                }
                                if (!retVal.edgeExists(e.id)) {
                                    retVal.addEdge(e);
                                }
                            }
                        });
                    });
                    queue = nextLevel;
                    level++;
                }
            });
            return retVal;
        }
        companies() {
            return this._graph.vertices()
                .filter(row => row.type === "company");
        }
        people() {
            return this._graph.vertices()
                .filter(row => row.type === "person");
        }
        updateNeighbors() {
            this._graph.vertices().forEach(v => {
                v.neighbors = {
                    company: 0,
                    person: 0
                };
                this._graph.neighbors(v.id).forEach(n => {
                    switch (n.type) {
                        case "company":
                            ++v.neighbors.company;
                            break;
                        case "person":
                            ++v.neighbors.person;
                            break;
                    }
                });
            });
        }
        vertices() {
            return this._graph.vertices();
        }
        edges() {
            return this._graph.edges();
        }
    }

    let m_rawData = devData;
    const db = new GraphDB()
        .load(m_rawData);
    function rawData(_) {
        if (!arguments.length)
            return m_rawData;
        m_rawData = _;
        db.load(_);
    }
    function fetchGraph(memberID, depth = 1) {
        const subgraph = db.subgraph(memberID, depth);
        return Promise.resolve({
            vertices: subgraph.vertices(),
            edges: subgraph.edges()
        });
    }
    function fetchCompanies() {
        return Promise.resolve(db.companies());
    }
    function fetchPeople() {
        return Promise.resolve(db.people());
    }

    //  Dock Panel ---
    class Dashboard extends phosphor.DockPanel {
        constructor(target) {
            super();
            // protected _data = new DataWrangler();
            this._mainGraph = new MainGraph()
                .on("vertex_dblclick", (row, col, sel) => {
                this.fetchGraph(row.id);
            });
            this._mainSankey = new MainSankey()
                .on("dblclick", (row, col, sel) => {
                this.fetchGraph(row.id);
            });
            this._companyTable = new CompanyTable()
                .on("click", () => this.tableSelection(this._companyTable.selection()));
            this._personTable = new PersonTable()
                .on("click", () => this.tableSelection(this._personTable.selection()));
            this._dataEditor = new DataEditor().json(rawData());
            this
                .target(target)
                .addWidget(this._mainGraph, "Graph")
                .addWidget(this._companyTable, "Companies", "split-bottom", this._mainGraph)
                .addWidget(this._mainSankey, "Sankey", "tab-after", this._mainGraph)
                .addWidget(this._personTable, "People", "tab-after", this._companyTable)
                .addWidget(this._dataEditor, "Data (paste here!!!)", "tab-after", this._personTable)
                .render();
            this._dataEditor.on("changes", () => {
                rawData(this._dataEditor.json());
                this.reset();
            });
        }
        reset() {
            fetchCompanies().then(companies => {
                this._companyTable
                    .loadData(companies.map((row) => {
                    var _a, _b, _c, _d, _e;
                    return [row.name, row.payload.duns, [[(_b = (_a = row.payload.address) === null || _a === void 0 ? void 0 : _a.addressCountry) === null || _b === void 0 ? void 0 : _b.name, (_d = (_c = row.payload.address) === null || _c === void 0 ? void 0 : _c.addressLocality) === null || _d === void 0 ? void 0 : _d.name, (_e = row.payload.address) === null || _e === void 0 ? void 0 : _e.postalCode]], row.payload.directOwnershipPercentage, row.payload.impliedDirectOwnershipPercentage, row];
                }));
            });
            fetchPeople().then(people => {
                this._personTable
                    .loadData(people.map((row) => {
                    var _a, _b, _c, _d, _e;
                    return [row.name, [[(_b = (_a = row.payload.address) === null || _a === void 0 ? void 0 : _a.addressCountry) === null || _b === void 0 ? void 0 : _b.name, (_d = (_c = row.payload.address) === null || _c === void 0 ? void 0 : _c.addressLocality) === null || _d === void 0 ? void 0 : _d.name, (_e = row.payload.address) === null || _e === void 0 ? void 0 : _e.postalCode]], row.payload.directOwnershipPercentage, row.payload.impliedDirectOwnershipPercentage, row];
                }));
            });
            this._mainGraph.resetLayout();
            fetchGraph().then(graph => {
                this._mainGraph
                    .loadData(graph.vertices, graph.edges);
                this._mainSankey
                    .loadData(graph.vertices, graph.edges);
                this.lazyRender();
            });
        }
        fetchGraph(id) {
            fetchGraph(id, 1).then(graph => {
                this._mainGraph
                    .mergeData(graph.vertices, graph.edges)
                    .resetLayout()
                    .lazyRender();
                this._mainSankey
                    .mergeData(graph.vertices, graph.edges)
                    .lazyRender();
            });
        }
        tableSelection(selection) {
            if (selection.length) {
                this._mainGraph
                    .selection([selection[0].__lparam])
                    .centerOnItem(selection[0].__lparam.id);
            }
        }
    }

    const app = new Dashboard("placeholder").lazyRender();
    window.addEventListener("resize", () => {
        app
            .resize()
            .lazyRender();
    });

})));
//# sourceMappingURL=index.js.map
