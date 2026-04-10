export const sample = {
    "version": "0.0.22",
    "datasources": [
        {
            "type": "databomb",
            "format": "json",
            "payload": "[{\"salesorganisation\":\"Australia\",\"product\":\"CB-0010\",\"product_group\":\"City bike (CB)\",\"distribution_channel\":\"Retail\",\"month\":\"January\",\"quantity\":\"6\",\"revenue\":\"250.1600036621094\"},{\"salesorganisation\":\"Australia\",\"product\":\"CB-0010\",\"product_group\":\"City bike (CB)\",\"distribution_channel\":\"Retail\",\"month\":\"February\",\"quantity\":\"12\",\"revenue\":\"250.1600036621094\"},{\"salesorganisation\":\"Australia\",\"product\":\"CB-0010\",\"product_group\":\"City bike (CB)\",\"distribution_channel\":\"Retail\",\"month\":\"March\",\"quantity\":\"17\",\"revenue\":\"250.1600036621094\"},{\"salesorganisation\":\"Australia\",\"product\":\"CB-0010\",\"product_group\":\"City bike (CB)\",\"distribution_channel\":\"Retail\",\"month\":\"May\",\"quantity\":\"61\",\"revenue\":\"313.760009765625\"},{\"salesorganisation\":\"Australia\",\"product\":\"CB-0010\",\"product_group\":\"City bike (CB)\",\"distribution_channel\":\"Retail\",\"month\":\"June\",\"quantity\":\"39\",\"revenue\":\"333.7999877929688\"},{\"salesorganisation\":\"Australia\",\"product\":\"CB-0010\",\"product_group\":\"City bike (CB)\",\"distribution_channel\":\"Retail\",\"month\":\"July\",\"quantity\":\"31\",\"revenue\":\"353.8299865722656\"},{\"salesorganisation\":\"Australia\",\"product\":\"CB-0010\",\"product_group\":\"City bike (CB)\",\"distribution_channel\":\"Retail\",\"month\":\"August\",\"quantity\":\"29\",\"revenue\":\"354.0\"},{\"salesorganisation\":\"Australia\",\"product\":\"CB-0010\",\"product_group\":\"City bike (CB)\",\"distribution_channel\":\"Retail\",\"month\":\"Septembe\",\"quantity\":\"24\",\"revenue\":\"413.0\"},{\"salesorganisation\":\"Australia\",\"product\":\"CB-0010\",\"product_group\":\"City bike (CB)\",\"distribution_channel\":\"Retail\",\"month\":\"October\",\"quantity\":\"9\",\"revenue\":\"413.0\"},{\"salesorganisation\":\"Australia\",\"product\":\"CB-0011\",\"product_group\":\"City bike (CB)\",\"distribution_channel\":\"Retail\",\"month\":\"January\",\"quantity\":\"5\",\"revenue\":\"470.6400146484375\"},{\"salesorganisation\":\"Australia\",\"product\":\"CB-0011\",\"product_group\":\"City bike (CB)\",\"distribution_channel\":\"Retail\",\"month\":\"February\",\"quantity\":\"10\",\"revenue\":\"472.0\"},{\"salesorganisation\":\"Australia\",\"product\":\"CB-0011\",\"product_group\":\"City bike (CB)\",\"distribution_channel\":\"Retail\",\"month\":\"March\",\"quantity\":\"19\",\"revenue\":\"472.0\"},{\"salesorganisation\":\"Australia\",\"product\":\"CB-0011\",\"product_group\":\"City bike (CB)\",\"distribution_channel\":\"Retail\",\"month\":\"April\",\"quantity\":\"41\",\"revenue\":\"472.0\"},{\"salesorganisation\":\"Australia\",\"product\":\"CB-0011\",\"product_group\":\"City bike (CB)\",\"distribution_channel\":\"Retail\",\"month\":\"May\",\"quantity\":\"35\",\"revenue\":\"500.7000122070312\"},{\"salesorganisation\":\"Australia\",\"product\":\"CB-0011\",\"product_group\":\"City bike (CB)\",\"distribution_channel\":\"Retail\",\"month\":\"June\",\"quantity\":\"73\",\"revenue\":\"518.0\"},{\"salesorganisation\":\"Australia\",\"product\":\"KB-0010\",\"product_group\":\"Kids bike (KB)\",\"distribution_channel\":\"Retail\",\"month\":\"January\",\"quantity\":\"5\",\"revenue\":\"950.47998046875\"},{\"salesorganisation\":\"Australia\",\"product\":\"KB-0010\",\"product_group\":\"Kids bike (KB)\",\"distribution_channel\":\"Retail\",\"month\":\"February\",\"quantity\":\"13\",\"revenue\":\"954.530029296875\"},{\"salesorganisation\":\"Australia\",\"product\":\"KB-0010\",\"product_group\":\"Kids bike (KB)\",\"distribution_channel\":\"Retail\",\"month\":\"May\",\"quantity\":\"56\",\"revenue\":\"973.02001953125\"},{\"salesorganisation\":\"Australia\",\"product\":\"KB-0010\",\"product_group\":\"Kids bike (KB)\",\"distribution_channel\":\"Retail\",\"month\":\"June\",\"quantity\":\"71\",\"revenue\":\"987.030029296875\"},{\"salesorganisation\":\"Australia\",\"product\":\"KB-0011\",\"product_group\":\"Kids bike (KB)\",\"distribution_channel\":\"Retail\",\"month\":\"January\",\"quantity\":\"6\",\"revenue\":\"1068.47998046875\"}]",
            "id": "Ins002_dsOutput1",
            "fields": [
                { "id": "salesorganisation", "type": "string", "default": [], "children": [] },
                { "id": "product", "type": "string", "default": [], "children": [] },
                { "id": "product_group", "type": "string", "default": [], "children": [] },
                { "id": "distribution_channel", "type": "string", "default": [], "children": [] },
                { "id": "month", "type": "string", "default": [], "children": [] },
                { "id": "quantity", "type": "number", "default": [], "children": [] },
                { "id": "revenue", "type": "number", "default": [], "children": [] }
            ]
        }
    ],
    "dataviews": [
        {
            "id": "table1",
            "datasource": { "id": "Ins002_dsOutput1" },
            "activities": [],
            "visualization": {
                "title": "Table 1",
                "description": "",
                "visibility": "normal",
                "id": "table1",
                "chartType": "Table",
                "__class": "grid_Table"
            }
        }
    ]
};
