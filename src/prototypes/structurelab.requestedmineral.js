let labRequests = {};

Object.defineProperty(StructureLab.prototype, "requestedMineral", {
    get: function() {
        if(this._requestedMineral) {
            return this._requestedMineral;
        } else {
            if (labRequests[this.id]) {
                return this._requestedMineral = labRequests[this.id];
            } else {
                return this._requestedMineral = this.mineralType;
            }
        }
    },
    set: function(resource) {
        labRequests[this.id] = resource;
        this._requestedMineral = resource;
    },
    enumerable: false,
    configurable: true,
});
