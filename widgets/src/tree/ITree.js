(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["../common/Palette"], factory);
    } else {
        root.I2DChart = factory(root.Palette);
    }
}(this, function (Palette) {
    function ITree() {
    };

    ITree.prototype.palette = Palette.ordinal("default");

    //  Data ---
    ITree.prototype.testData = function () {
        var data = {label: "root", children: [{
            label: "A",
            children: [{
                label: "AA",
                children: [{
                    label: "AAA"
                }]
            }, {
                label: "AB",
                children: [{
                    label: "ABA"
                }]
            }]
        }, {
            label: "B",
            children: [{
                label: "BA",
                children: [{
                    label: "BAA"
                }]
            }, {
                label: "BB"
            }]
        }]};
        this.data(data);
        return this;
    };

    //  Events  ---
    ITree.prototype.click = function (d) {
        console.log("Click:  " + d.label);
    };

    return ITree;
}));
