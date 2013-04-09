/*jshint es5: true */

function Class () {
    this.curMethod = null;
    this.curType = null;
    this.curPropertyWritable = true;
    this.legacyEnum = null;
    this.constructors = [];
    this.properties = [];
    this.methods = [];
    
    this.__defineGetter__("constructor", function () {
        this.curMethod = { params: [] };
        this.constructors.push(this.curMethod);
        return this;
    });
    this.__defineGetter__("writable", function () {
        this.curPropertyWritable = true;
        return this;
    });
    this.__defineGetter__("nonwritable", function () {
        this.curPropertyWritable = false;
        return this;
    });
    this.__defineGetter__("nullable", function () {
        if (!this.curType) throw("No type to make nullable");
        this.curType.nullable = true;
        return this;
    });
    this.__defineGetter__("nonconfigurable", function () {
        if (!this.curType) throw("No type to make nonconfigurable");
        this.curType.nonconfigurable = true;
        return this;
    });
}
Class.prototype = {
    importLegacyEnum:   function (leg) {
        if (this.legacyEnum) throw("Class already has a legacy enum");
        this.curMethod = null;
        this.legacyEnum = leg;
        return this;
    }
,   param:  function (type, name) {
        // XXX note that type may be an inline declaration for a dictionary/options
        if (!this.curMethod) throw("No current method or constructor on which to apply parameter");
        this.curType = { type: type, name: name };
        this.curMethod.params.push(this.curType);
        return this;
    }
,   property:  function (type, name) {
        this.curType = { type: type, name: name, writable: this.curPropertyWritable };
        this.properties.push(this.curType);
        return this;
    }
,   method:  function (type, name) {
        this.curType = { type: type };
        this.curMethod = { type: this.curType, name: name, params: [] };
        this.methods.push(this.curMethod);
        return this;
    }
,   toJSON: function () {
        return {
            legacyEnum:     this.legacyEnum
        ,   constructors:   this.constructors
        ,   properties:     this.properties
        ,   methods:        this.methods
        };
    }
};

module.exports = {
    legacyEnum: function () {
        var ret = {
            type:   "legacyEnum"
        ,   values: {}
        };
        for (var i = 0, n = arguments.length; i < n; i++) ret.values[arguments[i]] = i + 1;
        return ret;
    }
};
module.exports.__defineGetter__("class", function () { return new Class; });
