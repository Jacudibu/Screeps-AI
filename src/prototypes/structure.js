Structure.prototype.doesInGeneralStoreEnergy = function () {
    return this.structureType === STRUCTURE_EXTENSION
        || this.structureType === STRUCTURE_SPAWN
        || this.structureType === STRUCTURE_TOWER;
};

Structure.prototype.canStoreEnergy = function(amount) {
    return this.doesInGeneralStoreEnergy()
        && this.energyCapacity - this.energy >= amount;
};
