"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3"], factory);
    } else {
        root.common_Text = factory(root.d3);
    }
}(this, function (d3) {
    function Grid() {
        this.clear();
    }
    Grid.prototype.constructor = Grid;

    Grid.prototype.clear = function () {
        this._fields = [];
        this._data = [];
        return this;
    };

    //  Backward compatability  ---
    Grid.prototype.legacyColumns = function (_) {
        if (!arguments.length) return this.row(0);
        this.row(0, _);
        return this;
    };

    Grid.prototype.legacyData = function (_, clone) {
        return Grid.prototype.data.apply(this, arguments);
    };

    //  Meta  ---
    Grid.prototype.fields = function (_, clone) {
        if (!arguments.length) return this._fields;
        this._fields = clone ? _.map(function (d) { return d; }) : _;
        return this;
    };

    Grid.prototype.data = function (_, clone) {
        if (!arguments.length) return this._data;
        this._data = clone ? _.map(function (d) { return d.map(function (d2) { return d2; }); }) : _;
        return this;
    };
    //  Row Access  ---
    Grid.prototype.row = function (row, _) {
        if (arguments.length < 2) return row === 0 ? this._fields.map(function (d) { return d.label; }) : this._data[row - 1];
        if (row === 0) {
            this._fields = _.map(function (d) { return { label: d }; });
        } else {
            this._data[row - 1] = _;
        }
        return this;
    };

    Grid.prototype.rows = function (_) {
        if (!arguments.length) return [this.row(0)].concat(this._data);
        this.row(0, _[0]);
        this._data = _.filter(function (row, idx) { return idx > 0; });
        return this;
    }

    //  Column Access  ---
    Grid.prototype.column = function (col, _) {
        if (arguments.length < 2) return [this._fields[col].label].concat(this._data.map(function (row, idx) { return row[col]; }));
        _.forEach(function (d, idx) {
            if (idx === 0) {
                this._fields[col] = { label: _[0] };
            } else {
                this._data[idx - 1][col] = d;
            }
        }, this);
        return this;
    };

    Grid.prototype.columnData = function (col, _) {
        if (arguments.length < 2) return this._data.map(function (row, idx) { return row[col]; });
        _.forEach(function (d, idx) {
            this._data[idx][col] = d;
        }, this);
        return this;
    };

    Grid.prototype.columns = function (_) {
        if (!arguments.length) return this._fields.map(function (col, idx) {
            return this.column(idx);
        }, this);
        _.forEach(function (col, idx) {
            this.column(idx, _[idx]);
        }, this);
        return this;
    }

    //  Cell Access  ---
    Grid.prototype.cell = function (row, col, _) {
        if (arguments.length < 3) return this.row(row)[col];
        if (row === 0) {
            this._fields[col] = { label: _ };
        } else {
            this._data[row][col] = _;
        }
        return this;
    }

    //  Grid Access  ---
    Grid.prototype.grid = function (_) {
        return Grid.prototype.rows.apply(this, arguments)
    };

    //  Nesting  ---
    Grid.prototype._nest = function (columns, rollup) {
        if (!(columns instanceof Array)) {
            columns = [columns];
        }
        var nest = d3.nest();
        columns.forEach(function (col) {
            nest.key(function (d){
                return d[col];
            })
        });
        return nest;
    };

    Grid.prototype.nest = function (columns) {
        return this._nest(columns)
            .entries(this._data)
        ;
    };

    Grid.prototype.rollup = function (columns, rollup) {
        return this._nest(columns)
            .rollup(rollup)
            .entries(this._data)
        ;
    };

    //  Util  ---
    Grid.prototype.length = function () {
        return this._data.length + 1;
    }

    Grid.prototype.width = function () {
        return this._fields.length;
    }

    Grid.prototype.pivot = function () {
        this.rows(this.columns());
        return this;
    };

    Grid.prototype.clone = function (deep) {
        return new Grid()
            .fields(this.fields(), deep)
            .data(this.data(), deep)
        ;
    };

    Grid.prototype.analyse = function (columns) {
        if (!(columns instanceof Array)) {
            columns = [columns];
        }
        var retVal = [];
        columns.forEach(function (col) {
            //var column = this._fields[col].label;
            var rollup = this.rollup(col, function (leaves) {
                return leaves.length;
            });
            retVal.push(rollup);
            var keys = rollup.map(function (d) { return d.key; });
            this._fields[col].isBoolean = typeTest(keys, isBoolean);
            this._fields[col].isNumber = typeTest(keys, isNumber);
            this._fields[col].isString = !this._fields[col].isNumber && typeTest(keys, isString);
            this._fields[col].isUSState = this._fields[col].isString && typeTest(keys, isUSState);
            this._fields[col].isDateTime = this._fields[col].isString && typeTest(keys, isDateTime);
            this._fields[col].isDate = !this._fields[col].isDateTime && typeTest(keys, isDate);
            this._fields[col].isTime = this._fields[col].isString && !this._fields[col].isDateTime && !this._fields[col].isDate && typeTest(keys, isTime);
        }, this);
        return retVal;
    };

    //  Import/Export  ---
    Grid.prototype.jsonObj = function (_) {
        if (!arguments.length) return this._data.map(function (row) {
            var retVal = {};
            this.row(0).forEach(function (col, idx) {
                retVal[col] = row[idx];
            });
            return retVal;
        }, this);
        this.data(_.map(function (row, idx) {
            this.clear();
            var retVal = [];
            for (var key in row) {
                var colIdx = this.row(0).indexOf(key);
                if (colIdx < 0) {
                    colIdx = this._fields.length;
                    this._fields.push({ label: key });
                }
                retVal[colIdx] = row[key];
            }
            return retVal;
        }, this));
        return this;
    };

    Grid.prototype.json = function (_) {
        if (!arguments.length) return JSON.stringify(this.jsonObj(), null, "  ");
        this.jsonObj(JSON.parse(_));
        return this;
    };

    Grid.prototype.csv = function (_) {
        if (!arguments.length) return d3.csv.formatRows(this.grid());
        this.jsonObj(d3.csv.parse(_));
        return this;
    };

    Grid.prototype.tsv = function (_) {
        if (!arguments.length) return d3.tsv.formatRows(this.grid());
        this.jsonObj(d3.tsv.parse(_));
        return this;
    };

    //  --- --- ---
    function typeTest(cells, test) {
        if (!cells instanceof Array) {
            cells = [cells];
        }
        return cells.filter(function (d) { return d != ""; }).every(test);
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
    dateFormats.forEach(function(d) {
        timeFormats.forEach(function(t) {
            dateTimeFormats.push(d + "T" + t);
        });
    });
    function formatPicker(formats, cell) {
        for (var i = 0; i < formats.length; ++i) {
            var date = d3.time.format(formats[i]).parse(cell);
            if (date) {
                return formats[i];
            }
        }
        return null;
    };
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

    function fieldType(field) { }

    return {
        Grid: Grid,
    };
}));
