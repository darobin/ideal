/*jshint es5: true */

function sharedTypeGetters (obj) {
    obj.__defineGetter__("nullable", function () {
        if (!this.curType) throw("No type to make nullable");
        this.curType.nullable = true;
        return this;
    });
    obj.__defineGetter__("variadic", function () {
        if (!this.curType) throw("No type to make variadic");
        this.curType.variadic = true;
        return this;
    });
}

function makeParam (type, name) {
    // XXX note that type may be an inline declaration for a dictionary/options
    if (!this.curMethod) throw("No current method or constructor on which to apply parameter");
    this.curType = { type: type, name: name };
    this.curMethod.params.push(this.curType);
    return this;
}

function Class (abstract) {
    if (!abstract) abstract = false;
    this.curMethod = null;
    this.curType = null;
    this.curPropertyWritable = true;

    this.abstract = abstract;
    this.extending = null;
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
    this.__defineGetter__("nonconfigurable", function () {
        if (!this.curType) throw("No type to make nonconfigurable");
        this.curType.nonconfigurable = true;
        return this;
    });
    sharedTypeGetters(this);
}
Class.prototype = {
    importLegacyEnum:   function (leg) {
        if (this.legacyEnum) throw("Class already has a legacy enum");
        this.curMethod = null;
        this.legacyEnum = leg;
        return this;
    }
,   param:  makeParam
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
,   extends: function (type) {
        this.extending = type;
        return this;
    }
,   default:    function (value) {
        if (!this.curType) throw("No type to default");
        this.curType.default = value;
        return this;
    }
,   toJSON: function () {
        return {
            type:           "class"
        ,   legacyEnum:     this.legacyEnum
        ,   constructors:   this.constructors
        ,   properties:     this.properties
        ,   methods:        this.methods
        ,   extends:        this.extending
        };
    }
};

function Callback (type) {
    this.curMethod = { type: this.curType, params: [] };
    this.curType = type;
    sharedTypeGetters(this);
}
Callback.prototype = {
    param:  makeParam
,   toJSON: function () {
        return {
            type:       "callback"
        ,   method:     this.curMethod
        ,   returns:    this.curType
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
,   union:  function () {
        return {
            type:   "union"
        ,   values: Array.prototype.slice.call(arguments)
        };
    }
,   callback:  function (type) {
        return new Callback(type);
    }
};
module.exports.__defineGetter__("class", function () { return new Class; });
module.exports.__defineGetter__("interface", function () { return new Class(true); });
module.exports.__defineGetter__("any", function () { return { type: "any" }; });
