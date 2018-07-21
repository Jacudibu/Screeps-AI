Structure.prototype.doesInGeneralStoreEnergy = function () {
    return this.structureType === STRUCTURE_EXTENSION
        || this.structureType === STRUCTURE_SPAWN
        || this.structureType === STRUCTURE_CONTAINER
        || this.structureType === STRUCTURE_STORAGE;
};

Structure.prototype.canStoreEnergy = function(amount) {
    return this.doesInGeneralStoreEnergy()
        && this.energyCapacity - this.energy >= amount;
};

Structure.prototype.canReleaseEnergy = function(amount) {
    return this.doesInGeneralStoreEnergy()
        && this.energy >= amount;
};