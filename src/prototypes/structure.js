Structure.prototype.doesInGeneralStoreEnergy = function () {
    return this.structureType === STRUCTURE_EXTENSION
        || this.structureType === STRUCTURE_SPAWN
        || this.structureType === STRUCTURE_STORAGE
        || this.structureType === STRUCTURE_TOWER;
};

Structure.prototype.doesInGeneralReleaseEnergy = function() {
    return this.structureType === STRUCTURE_EXTENSION
        || this.structureType === STRUCTURE_SPAWN
        || this.structureType === STRUCTURE_STORAGE
        || this.structureType === STRUCTURE_CONTAINER;
};

Structure.prototype.canStoreEnergy = function(amount) {
    return this.doesInGeneralStoreEnergy()
        && this.energyCapacity - this.energy >= amount;
};

Structure.prototype.canReleaseEnergy = function(amount) {
    return this.doesInGeneralReleaseEnergy()
        && this.energy >= amount;
};