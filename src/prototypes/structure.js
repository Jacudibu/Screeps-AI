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