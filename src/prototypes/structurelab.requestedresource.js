let labRequests = {};

Object.defineProperty(StructureLab.prototype, "requestedResource", {
    get: function() {
        if(this._requestedResource) {
            return this._requestedResource;
        } else {
            if (labRequests[this.name]) {
                return this._requestedResource = labRequests[this.id];
            } else {
                return this._requestedResource = this.mineralType;
            }
        }
    },
    set: function(resource) {
        labRequests[this.id] = resource;
        this._requestedResource = resource;
    },
    enumerable: false,
    configurable: true,
});
