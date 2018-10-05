const evacuations = {};
Object.defineProperty(Room.prototype, "shouldEvacuate", {
    get: function() {
        if (evacuations[this.name] !== undefined) {
            return evacuations[this.name];
        }

        if (this.memory.shouldEvacuate) {
            return evacuations[this.name] = true;
        }

        return evacuations[this.name] = false;
    },

    set: function() {},
    configurable: false,
    enumerable: false,
});

Room.prototype.activateEvacuationProcedures = function() {
    log.warning(this + " Started evacuation procedures");
    evacuations[this.name] = true;
    this.memory.shouldEvacuate = true;
};

Room.prototype.disableEvacuationProcedures = function() {
    log.warning(this + " Stopped evacuation procedures");
    evacuations[this.name] = false;
    this.memory.shouldEvacuate = false;
};