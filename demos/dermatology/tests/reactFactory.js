﻿"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        root.test_otherFactory = factory();
    }
}(this, function () {
    return {
        GC: {
            simple: function (callback) {
                legacyRequire(["src/graph/Test"], function (Test) {
                    callback(new Test());
                });
            }
        },
        TSXSVG: {
            simple: function (callback) {
                legacyRequire(["test/DataFactory", "src/html/TSXSVG"], function (DataFactory, TSXSVG) {
                    const w = new TSXSVG();
                    callback(w);
                });
            }
        },
        DDL: {
            simple: function (callback) {
                legacyRequire(["test/DataFactory", "src/codemirror/DDLEditor"], function (DataFactory, ECLEditor) {
                    callback(new ECLEditor());
                });
            }
        },
        Orb: {
            simple: function (callback) {
                legacyRequire(["test/DataFactory", "src/react/Orb"], function (DataFactory, Orb) {
                    callback(new Orb()
                        .data(DataFactory.Pivot.subjects.data)
                        .columns(DataFactory.Pivot.subjects.columns)
                    );
                });
            }
        }
    };
}));
