Structure.prototype.canStillStoreEnergy = function() {
    return false;
};

const structureWithStore = function() {
    return this.store[RESOURCE_ENERGY] < this.storeCapacity;
};

StructureContainer.prototype.canStillStoreEnergy = structureWithStore;
StructureStorage.prototype.canStillStoreEnergy   = structureWithStore;
StructureTerminal.prototype.canStillStoreEnergy  = structureWithStore;

const structureWithEnergyProperty = function() {
    return this.energy < this.energyCapacity;
};

StructureExtension.prototype.canStillStoreEnergy  = structureWithEnergyProperty;
StructureLab.prototype.canStillStoreEnergy        = structureWithEnergyProperty;
StructureTower.prototype.canStillStoreEnergy      = structureWithEnergyProperty;
StructureSpawn.prototype.canStillStoreEnergy      = structureWithEnergyProperty;
StructureLink.prototype.canStillStoreEnergy       = structureWithEnergyProperty;
StructureNuker.prototype.canStillStoreEnergy      = structureWithEnergyProperty;
StructurePowerSpawn.prototype.canStillStoreEnergy = structureWithEnergyProperty;