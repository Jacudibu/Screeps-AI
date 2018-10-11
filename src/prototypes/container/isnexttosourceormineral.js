const containerValues = {};

Object.defineProperty(StructureContainer.prototype, "isNextToSourceOrMineral", {
    get: function() {
        if (containerValues[this.id] !== undefined) {
            return containerValues[this.id];
        } else {
            return containerValues[this.id] = this.pos.findInRange(FIND_SOURCES, 1).length > 0
                                           || this.pos.findInRange(FIND_MINERALS, 1).length > 0;
        }
    },
    set: function() {},
    enumerable: false,
    configurable: true,
});