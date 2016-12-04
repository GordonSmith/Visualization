import * as d3 from 'd3';
import { Class } from './Class';
import { PropertyExt } from './PropertyExt';
import * as Utility from './Utility';

//  Field  ---
export class Field extends PropertyExt {
    static _class = "common_Database.Field";

    constructor(id?) {
        super();
        PropertyExt.call(this);

        this._id = id || this._id;
    }

    checksum() {
        return Utility.checksum(this.label() + this.type() + this.mask() + this.format());
    };

    typeTransformer(_) {
        switch (this.type()) {
            case "number":
                return Number(_);
            case "string":
                return String(_);
            case "boolean":
                return typeof (_) === "string" && ["false", "off", "0"].indexOf(_.toLowerCase()) >= 0 ? false : Boolean(_);
            case "time":
            case "date":
                return this.maskTransformer(_);
        }
        return _;
    };

    maskTransformer(_) {
        return this.formatter(this.mask()).parse(_);
    };

    formatTransformer(_) {
        return this.formatter(this.format())(_);
    };

    parse(_) {
        if (!_) {
            return _;
        }
        try {
            return this.typeTransformer(_);
        } catch (e) {
            console.log("Unable to parse:  " + _);
            return null;
        }
    };

    transform(_) {
        if (!_) {
            return _;
        }
        try {
            return this.formatTransformer(this.typeTransformer(_));
        } catch (e) {
            console.log("Unable to transform:  " + _);
            return null;
        }
    };

    clone() {
        var context = this;
        var retVal = new Field(this._id);
        cloneProp(retVal, "label");
        cloneProp(retVal, "type");
        cloneProp(retVal, "mask");
        cloneProp(retVal, "format");

        function cloneProp(dest, key) {
            dest[key + "_default"](context[key + "_default"]());
            if (context[key + "_exists"]()) {
                dest[key](context[key]());
            }
        }
        return retVal;
    };

    formatter(format) {
        var retVal;
        if (!format) {
            retVal = function (_) {
                return _;
            };
            retVal.parse = function (_) {
                return _;
            };
            return retVal;
        }
        switch (this.type()) {
            case "time":
            case "date":
                return d3.time.format(format);
        }
        retVal = d3.format(format);
        retVal.parse = function (_) {
            return _;
        };
        return retVal;
    };

    label(_?): string | Field { throw "unimplemented" };
    type(_?): any | Field { throw "unimplemented" };
    mask(_?): string | Field { throw "unimplemented" };
    format(_?): string | Field { throw "unimplemented" };
}
Field.prototype.publish("label", "", "string", "Label", null, { optional: true });
Field.prototype.publish("type", "", "set", "Type", ["", "string", "number", "boolean", "time", "hidden"], { optional: true });
Field.prototype.publish("mask", "", "string", "Time Mask", null, { disable: function (w) { return w.type() !== "time"; }, optional: true });
Field.prototype.publish("format", "", "string", "Format", null, { optional: true });


//  Grid  ---
export class Grid extends PropertyExt {
    static _class = "common_Database.Grid";

    private _dataChecksum: boolean;
    private _dataVersion = 0;

    private _data = [];
    private _dataChecksums = [];

    constructor(dataChecksum = false) {
        super();
        this._dataChecksum = dataChecksum;
        this.clear();
    }

    clear() {
        this.fields([]);
        this._data = [];
        this._dataChecksums = [];
        ++this._dataVersion;
        return this;
    };

    //  Backward compatability  ---
    resetColumns() {
        var fields = this.fields();
        this.legacyColumns([]);
        this.legacyColumns(fields.map(function (field) {
            return field.label();
        }));
    };

    legacyColumns(_?): any | Grid {
        if (!arguments.length) return this.row(0);
        this.row(0, _);
        return this;
    };

    legacyData(_?, clone?) {
        return Grid.prototype.data.apply(this, arguments);
    };

    //  Meta  ---
    field(idx) {
        return this.fields()[idx];
    };

    fieldByLabel(_, ignoreCase) {
        return this.fields().filter(function (field, idx) { field.idx = idx; return ignoreCase ? field.label().toLowerCase() === _.toLowerCase() : field.label() === _; })[0];
    };

    data(_?, clone?): any | Grid {
        if (!arguments.length) return this._data;
        this._data = clone ? _.map(function (d) { return d.map(function (d2) { return d2; }); }) : _;
        this._dataCalcChecksum();
        return this;
    };

    parsedData() {
        var context = this;
        return this._data.map(function (row) {
            return row.map(function (cell, idx) {
                return context.fields()[idx].parse(cell);
            });
        });
    };

    formattedData() {
        var context = this;
        return this._data.map(function (row) {
            return row.map(function (cell, idx) {
                return context.fields()[idx].transform(cell);
            });
        });
    };

    fieldsChecksum() {
        return Utility.checksum(this.fields().map(function (field) { return field.checksum(); }));
    };

    dataChecksum() {
        return Utility.checksum(this._dataChecksum ? this._dataChecksums : this._dataVersion);
    };

    checksum() {
        return Utility.checksum([this.dataChecksum(), this.fieldsChecksum()]);
    };

    //  Row Access  ---
    private _dataCalcChecksum(idx?) {
        ++this._dataVersion;
        if (this._dataChecksum) {
            if (arguments.length) {
                this._dataChecksums[idx] = Utility.checksum(this._data[idx]);
            } else {
                this._dataChecksums = this._data.map(function (row) { return Utility.checksum(row); });
            }
        }
        return this;
    };

    row(row?, _?): any | Grid {
        if (arguments.length < 2) return row === 0 ? this.fields().map(function (d) { return d.label(); }) : this._data[row - 1];
        if (row === 0) {
            var fieldsArr = this.fields();
            this.fields(_.map(function (label, idx) {
                return (fieldsArr[idx] || new Field()).label_default(label);
            }, this));
        } else {
            this._data[row - 1] = _;
            this._dataCalcChecksum(row - 1);
        }
        return this;
    };

    rows(_?): any | Grid {
        if (!arguments.length) return [this.row(0)].concat(this._data);
        this.row(0, _[0]);
        this._data = _.filter(function (row, idx) { return idx > 0; });
        this._dataCalcChecksum();
        return this;
    };

    //  Column Access  ---
    column(col, _?): any | Grid {
        if (arguments.length < 2) return [this.fields()[col].label()].concat(this._data.map(function (row, idx) { return row[col]; }));
        _.forEach(function (d, idx) {
            if (idx === 0) {
                this.fields()[col] = new Field().label(_[0]);
            } else {
                this._data[idx - 1][col] = d;
                this._dataCalcChecksum(idx - 1);
            }
        }, this);
        return this;
    };

    columnData(col, _): any | Grid {
        if (arguments.length < 2) return this._data.map(function (row, idx) { return row[col]; });
        _.forEach(function (d, idx) {
            this._data[idx][col] = d;
            this._dataCalcChecksum(idx);
        }, this);
        return this;
    };

    columns(_?) {
        if (!arguments.length) return this.fields().map(function (col, idx) {
            return this.column(idx);
        }, this);
        _.forEach(function (col, idx) {
            this.column(idx, _[idx]);
        }, this);
        return this;
    };

    //  Cell Access  ---
    cell(row, col, _) {
        if (arguments.length < 3) return this.row(row)[col];
        if (row === 0) {
            this.fields()[col] = new Field().label(_);
        } else {
            this._data[row][col] = _;
            this._dataCalcChecksum(row);
        }
        return this;
    };

    //  Grid Access  ---
    grid(_?) {
        return Grid.prototype.rows.apply(this, arguments);
    };

    //  Hipie Helpers  ---
    hipieMapSortArray(sort) {
        return sort.map(function (sortField) {
            var reverse = false;
            if (sortField.indexOf("-") === 0) {
                sortField = sortField.substring(1);
                reverse = true;
            }
            var field = this.fieldByLabel(sortField, true);
            if (!field) {
                console.log("Grid.prototype.hipieMapSortArray:  Invalid sort array - " + sortField);
            }
            return {
                idx: field ? field.idx : -1,
                reverse: reverse
            };
        }, this).filter(function (d) { return d.idx >= 0; });
    };

    hipieMappings(columns, missingDataString) {
        missingDataString = missingDataString || "";
        if (!this.fields().length || !this._data.length) {
            return [];
        }
        var rollupField = -1;
        var rollupValueIdx = [];
        var rollupBy = [];
        var scaleField = -1;
        var fieldIndicies = [];
        columns.forEach(function (mapping, key) {
            if (mapping instanceof Object) {
                switch (mapping.function) {
                    case "SUM":
                    case "AVE":
                    case "MIN":
                    case "MAX":
                        if (rollupField >= 0) {
                            console.log("Rollup field already exists - there should only be one?");
                        }
                        rollupField = key;
                        mapping.params.forEach(function (params) {
                            var field = this.fieldByLabel(params.param1, true);
                            if (!field) {
                                console.log("Grid.prototype.hipieMappings:  Invalid rollup field - " + params.param1);
                            } else {
                                rollupValueIdx.push(field.idx);
                            }
                        }, this);
                        break;
                    case "SCALE":
                        if (scaleField >= 0) {
                            console.log("Scale field already exists - there should only be one?");
                        }
                        scaleField = key;
                        mapping.params.forEach(function (params) {
                            var field = this.fieldByLabel(params.param1, true);
                            if (!field) {
                                console.log("Grid.prototype.hipieMappings:  Invalid scale field - " + params.param1);
                            } else {
                                var idx = field.idx;
                                var scale = params.param2;
                                fieldIndicies.push(function (row) {
                                    return row[idx] / scale;
                                });
                            }
                        }, this);
                        break;
                    default:
                        console.log("Unknown field function - " + mapping.function);
                }
            } else if (mapping.indexOf("_AVE") === mapping.length - 4 && this.fieldByLabel(mapping.substring(0, mapping.length - 4) + "_SUM", true) && this.fieldByLabel("base_count", true)) {
                //  Symposium AVE Hack
                console.log("Deprecated - Symposium AVE Hack");
                var sumField = this.fieldByLabel(mapping.substring(0, mapping.length - 4) + "_SUM", true);
                var baseCountField = this.fieldByLabel("base_count", true);
                rollupBy.push(sumField.idx);
                fieldIndicies.push(function (row) {
                    return row[sumField.idx] / row[baseCountField.idx];
                });
            } else {
                var field = this.fieldByLabel(mapping, true);
                if (field) {
                    rollupBy.push(field.idx);
                    fieldIndicies.push(function (row) {
                        return row[field.idx] !== undefined && row[field.idx] !== null ? row[field.idx] : missingDataString;
                    });
                } else {
                    console.log("Unable to locate '" + mapping + "' in server response.");
                    fieldIndicies.push(function (row) {
                        return missingDataString;
                    });
                }
            }
        }, this);

        function nodeToRow(node, idx, _row, retVal) {
            var row = _row.map(function (d) { return d; });
            row[idx] = node.key;
            if (node.values instanceof Array) {
                node.values.forEach(function (d) {
                    nodeToRow(d, idx + 1, row, retVal);
                });
            } else {
                row[idx + 1] = node.values;
                retVal.push(row);
            }
        }
        if (rollupField >= 0) {
            var mapping = columns[rollupField];
            var params = [];
            for (var param in mapping.params) {
                params.push(mapping.params[param]);
            }
            var nested = this.rollup(rollupBy, function (leaves) {
                switch (mapping.function) {
                    case "SUM":
                        return d3.sum(leaves, function (d) { return d[rollupValueIdx[0]]; });
                    case "AVE":
                        return d3.mean(leaves, function (d) { return d[rollupValueIdx[0]]; });
                    case "MIN":
                        return d3.min(leaves, function (d) { return d[rollupValueIdx[0]]; });
                    case "MAX":
                        return d3.max(leaves, function (d) { return d[rollupValueIdx[0]]; });
                }
                console.log("Unsupported Mapping Function:  " + mapping.function);
                return 0;
            });
            var retVal = [];
            if (nested instanceof Array) {
                nested.forEach(function (d) {
                    nodeToRow(d, 0, [], retVal);
                });
            } else {
                retVal.push([nested]);
            }
            return retVal;
        } else {
            return this._data.map(function (row) {
                var retVal = [];
                fieldIndicies.forEach(function (func) {
                    retVal.push(func(row));
                });
                return retVal;
            });
        }
    };

    legacyView() {
        return new LegacyView(this);
    };

    nestView(columnIndicies) {
        return new RollupView(this, columnIndicies);
    };

    rollupView(columnIndicies, rollupFunc) {
        return new RollupView(this, columnIndicies, rollupFunc);
    };

    aggregateView(columnIndicies, aggrType, aggrColumn, aggrDeltaColumn) {
        var context = this;
        return new RollupView(this, columnIndicies, function (values) {
            switch (aggrType) {
                case null:
                case undefined:
                case "":
                    values.aggregate = values.length;
                    return values;
                default:
                    var columns = context.legacyColumns();
                    var colIdx = columns.indexOf(aggrColumn);
                    var deltaIdx = columns.indexOf(aggrDeltaColumn);
                    values.aggregate = d3[aggrType](values, function (value) {
                        return (+value[colIdx] - (deltaIdx >= 0 ? +value[deltaIdx] : 0)) / (deltaIdx >= 0 ? +value[deltaIdx] : 1);
                    });
                    return values;
            }
        });
    };

    //  Nesting  ---
    private _nest(columnIndicies, rollup?) {
        if (!(columnIndicies instanceof Array)) {
            columnIndicies = [columnIndicies];
        }
        var nest = d3.nest();
        columnIndicies.forEach(function (idx) {
            nest.key(function (d) {
                return d[idx];
            });
        });
        return nest;
    };

    nest(columnIndicies) {
        return this._nest(columnIndicies)
            .entries(this._data)
            ;
    };

    rollup(columnIndicies, rollup) {
        return this._nest(columnIndicies)
            .rollup(rollup)
            .entries(this._data)
            ;
    };

    //  Util  ---
    length() {
        return this._data.length + 1;
    };

    width() {
        return this.fields().length;
    };

    pivot() {
        this.resetColumns();
        this.rows(this.columns());
        return this;
    };

    clone(deep) {
        return new Grid()
            .fields(this.fields(), deep)
            .data(this.data(), deep)
            ;
    };

    filter(filter) {
        var filterIdx = {};
        this.row(0).forEach(function (col, idx) {
            filterIdx[col] = idx;
        });
        return new Grid()
            .fields(this.fields(), true)
            .data(this.data().filter(function (row) {
                for (var key in filter) {
                    if (filter[key] !== row[filterIdx[key]]) {
                        return false;
                    }
                }
                return true;
            }))
            ;
    };

    private _lastFoundFormat = null;
    analyse(columns) {
        if (!(columns instanceof Array)) {
            columns = [columns];
        }
        var retVal = [];
        columns.forEach(function (col) {
            var rollup = this.rollup(col, function (leaves) {
                return leaves.length;
            });
            retVal.push(rollup);
            var keys = rollup.map(function (d) { return d.key; });
            this.fields()[col].isBoolean = typeTest(keys, isBoolean);
            this.fields()[col].isNumber = typeTest(keys, isNumber);
            this.fields()[col].isString = !this.fields()[col].isNumber && typeTest(keys, isString);
            this.fields()[col].isUSState = this.fields()[col].isString && typeTest(keys, isUSState);
            this.fields()[col].isDateTime = this.fields()[col].isString && typeTest(keys, isDateTime);
            this.fields()[col].isDateTimeFormat = this._lastFoundFormat;
            this.fields()[col].isDate = !this.fields()[col].isDateTime && typeTest(keys, isDate);
            this.fields()[col].isDateFormat = this._lastFoundFormat;
            this.fields()[col].isTime = this.fields()[col].isString && !this.fields()[col].isDateTime && !this.fields()[col].isDate && typeTest(keys, isTime);
            this.fields()[col].isTimeFormat = this._lastFoundFormat;
        }, this);
        return retVal;
    };

    //  Import/Export  ---
    jsonObj(_?): any | Grid {
        if (!arguments.length) return this._data.map(function (row) {
            var retVal = {};
            this.row(0).forEach(function (col, idx) {
                retVal[col] = row[idx];
            });
            return retVal;
        }, this);
        this.clear();
        this.data(_.map(function (row, idx) {
            var retVal = [];
            for (var key in row) {
                var colIdx = this.row(0).indexOf(key);
                if (colIdx < 0) {
                    colIdx = this.fields().length;
                    this.fields().push(new Field().label(key));
                }
                retVal[colIdx] = row[key];
            }
            return retVal;
        }, this));
        return this;
    };

    json(_?): string | Grid {
        if (!arguments.length) return JSON.stringify(this.jsonObj(), null, "  ");
        this.jsonObj(JSON.parse(_));
        return this;
    };

    csv(_?): string | Grid {
        if (!arguments.length) return d3.csv.formatRows(this.grid());
        this.jsonObj(d3.csv.parse(_));
        return this;
    };

    tsv(_?): string | Grid {
        if (!arguments.length) return d3.tsv.formatRows(this.grid());
        this.jsonObj(d3.tsv.parse(_));
        return this;
    };


    fields(_?, clone?): any | Grid { throw "unimplemented"; }
}

Grid.prototype.publish("fields", [], "propertyArray", "Fields");
var fieldsOrig = Grid.prototype.fields;
Grid.prototype.fields = function (_?, clone?) {
    if (!arguments.length) return fieldsOrig.apply(this, arguments);
    return fieldsOrig.call(this, clone ? _.map(function (d) { return d.clone(); }) : _);
};

//  Views  ---
class LegacyView {
    _grid;
    _parsedData;
    _parsedDataChecksum;
    _formattedData;
    _formattedDataChecksum;

    constructor(grid) {
        this._grid = grid;
        d3.rebind(this, this._grid, "checksum", "fields");
    }
    grid() {
        return this._grid;
    };
    columns(_?) {
        if (!arguments.length) return this._grid.legacyColumns();
        this._grid.legacyColumns(_);
        return this;
    };
    rawData(_?) {
        if (!arguments.length) return this._grid.legacyData();
        this._grid.legacyData(_);
        return this;
    };
    formattedData() {
        if (this._formattedDataChecksum !== this._grid.checksum()) {
            this._formattedDataChecksum = this._grid.checksum();
            this._formattedData = this._grid.formattedData();
        }
        return this._formattedData;
    };
    parsedData() {
        if (this._parsedDataChecksum !== this._grid.checksum()) {
            this._parsedDataChecksum = this._grid.checksum();
            this._parsedData = this._grid.parsedData();
        }
        return this._parsedData;
    };
    protected _whichData(opts) {
        if (opts) {
            if (opts.parsed) {
                return this.formattedData();
            } else if (opts.formatted) {
                return this.formattedData();
            }
        }
        return this.rawData();
    };
    data(_) {
        return LegacyView.prototype.rawData.apply(this, arguments);
    };
}

class RollupView extends LegacyView {
    _columnIndicies;
    _rollup;
    _nestChecksum;
    _nest;

    constructor(grid, columns, rollup?) {
        super(grid);
        if (!(columns instanceof Array)) {
            columns = [columns];
        }
        this._columnIndicies = columns.filter(function (column) { return column; }).map(function (column) {
            switch (typeof column) {
                case "string":
                    return this._grid.fieldByLabel(column).idx;
            }
            return column;
        }, this);

        rollup = rollup || function (d) { return d; };
        this._rollup = rollup;
    }

    nest() {
        if (this._nestChecksum !== this._grid.checksum()) {
            this._nestChecksum = this._grid.checksum();

            var nest = d3.nest();
            this._columnIndicies.forEach(function (idx) {
                nest.key(function (d) {
                    return d[idx];
                });
            });
            this._nest = nest
                .rollup(this._rollup)
                ;
        }
        return this._nest;
    };
    entries(opts) {
        return this.nest().entries(this._whichData(opts));
    };
    map(opts) {
        return this.nest().map(this._whichData(opts));
    };
    d3Map(opts) {
        return this.nest().map(this._whichData(opts), d3.map);
    };
    _walkData(entries, prevRow = []) {
        var retVal = [];
        entries.forEach(function (entry) {
            if (entry instanceof Array) {
                retVal.push(prevRow.concat([entry]));
            } else {
                retVal = retVal.concat(this._walkData(entry.values, prevRow.concat([entry.key])));
            }
        }, this);
        return retVal;
    };
    data(opts) {
        return this._walkData(this.entries(opts));
    };
}



//  --- --- ---
function typeTest(cells, test) {
    if (!(cells instanceof Array)) {
        cells = [cells];
    }
    return cells.filter(function (d) { return d !== ""; }).every(test);
}
function isBoolean(cell) {
    return typeof cell === "boolean";
}
function isNumber(cell) {
    return typeof cell === "number" || !isNaN(cell);
}
function isString(cell) {
    return typeof cell === "string";
}
var dateTimeFormats = [
];
var dateFormats = [
    "%Y-%m-%d",
    "%Y%m%d",
];
var timeFormats = [
    "%H:%M:%S.%LZ",
    "%H:%M:%SZ",
    "%H:%M:%S"
];
dateFormats.forEach(function (d) {
    timeFormats.forEach(function (t) {
        dateTimeFormats.push(d + "T" + t);
    });
});
function formatPicker(formats, cell) {
    for (var i = 0; i < formats.length; ++i) {
        var date = d3.time.format(formats[i]).parse(cell);
        if (date) {
            this._lastFoundFormat = formats[i];
            return formats[i];
        }
    }
    return null;
}
function isDateTime(cell) {
    return formatPicker(dateTimeFormats, cell);
}
function isDate(cell) {
    return formatPicker(dateFormats, cell);
}
function isTime(cell) {
    return formatPicker(timeFormats, cell);
}
function isUSState(cell) {
    return ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "AS", "DC", "FM", "GU", "MH", "MP", "PW", "PR", "VI"].indexOf(String(cell).toUpperCase()) >= 0;
}