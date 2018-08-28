Structure.prototype.doesInGeneralStoreEnergy = function () {
    return this.structureType === STRUCTURE_EXTENSION
        || this.structureType === STRUCTURE_SPAWN
        || this.structureType === STRUCTURE_TOWER;
};

Structure.prototype.canStoreEnergy = function(amount) {
    return this.doesInGeneralStoreEnergy()
        && this.energyCapacity - this.energy >= amount;
};

Structure.prototype.canStillStoreEnergy = function() {
    switch (this.structureType) {
        case STRUCTURE_CONTAINER:
        case STRUCTURE_STORAGE:
        case STRUCTURE_TERMINAL:
            return this.store[RESOURCE_ENERGY] < this.storeCapacity;

        case STRUCTURE_EXTENSION:
        case STRUCTURE_LAB:
        case STRUCTURE_TOWER:
        case STRUCTURE_SPAWN:
        case STRUCTURE_LINK:
        case STRUCTURE_NUKER:
        case STRUCTURE_POWER_SPAWN:
            return this.energy < this.energyCapacity;

        default:
            return false;
    }
};