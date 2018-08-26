// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~ finder functions for various things not yet implemented elesewhere ~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Creep.prototype.findClosestFilledEnergyStructure = function() {
    const energyStorages = [];

    if (this.room.spawns) {
        this.room.spawns.map(spawn => {
            if (spawn.energy === 300) {
                energyStorages.push(spawn);
            }
        })
    }

    if (this.room.containers) {
        this.room.containers.map(container => {
            if (container.store[RESOURCE_ENERGY] >= this.carryCapacity) {
                energyStorages.push(container);
            }
        })
    }

    if (this.room.storage) {
        if (this.room.storage.store[RESOURCE_ENERGY] >= this.carryCapacity) {
            energyStorages.push(this.room.storage);
        }
    }

    if (this.room.terminal) {
        if (this.room.terminal.store[RESOURCE_ENERGY] >= TERMINAL_MIN_ENERGY_STORAGE) {
            energyStorages.push(this.room.terminal);
        }
    }

    if (energyStorages.length === 0) {
        return ERR_NOT_FOUND;
    }

    return _.sortBy(energyStorages, s => this.pos.getRangeTo(s))[0];
};

Creep.prototype.findClosestFilledEnergyStorage = function() {
    const filledEnergyStorages = [];

    if (this.room.containers) {
        this.room.containers.map(container => {
            if (container.store[RESOURCE_ENERGY] >= this.carryCapacity) {
                filledEnergyStorages.push(container);
            }
        })
    }

    if (this.room.storage) {
        if (this.room.storage.store[RESOURCE_ENERGY] >= this.carryCapacity) {
            filledEnergyStorages.push(this.room.storage);
        }
    }

    if (this.room.terminal) {
        if (this.room.terminal.store[RESOURCE_ENERGY] >= TERMINAL_MIN_ENERGY_STORAGE) {
            filledEnergyStorages.push(this.room.terminal);
        }
    }

    if (filledEnergyStorages.length === 0) {
        return ERR_NOT_FOUND;
    }

    return _.sortBy(filledEnergyStorages, s => this.pos.getRangeTo(s))[0];
};

Creep.prototype.findClosestFreeEnergyStorage = function() {
    let structuresThatRequireEnergy = this.room.getFreeSpawnsTowersOrExtensions();

    if (structuresThatRequireEnergy !== ERR_NOT_FOUND) {
        return _.sortBy(structuresThatRequireEnergy, s => this.pos.getRangeTo(s))[0];
    }

    let publicEnergyContainers = this.room.getEmptyPublicEnergyContainers();
    if (publicEnergyContainers !== ERR_NOT_FOUND) {
        return _.sortBy(publicEnergyContainers, c => this.pos.getRangeTo(c))[0]
    }

    let labs = this.room.labs;
    if (labs && labs.length > 0) {
        let labsThatNeedEnergy = labs.filter(lab => lab.energy < lab.energyCapacity);
        if (labsThatNeedEnergy && labsThatNeedEnergy.length > 0) {
            return labsThatNeedEnergy[0];
        }
    }

    if (this.room.terminal) {
        if (this.room.terminal.store[RESOURCE_ENERGY] < TERMINAL_MAX_ENERGY_STORAGE) {
            return this.room.terminal;
        }
    }

    let storage = this.room.storage;
    if (storage) {
        if (storage.store[RESOURCE_ENERGY] < STORAGE_MAX_ENERGY) {
            return storage;
        }
    }

    if (this.room.terminal) {
        if (_.sum(this.room.terminal.store) < TERMINAL_CAPACITY) {
            return this.room.terminal;
        }
    }

    return ERR_NOT_FOUND;
};

Creep.prototype.findClosestContainerAboveHaulThreshold = function() {
    const publicEnergyContainer = this.room.memory.publicEnergyContainers;
    const container = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_CONTAINER
                && !(publicEnergyContainer && publicEnergyContainer.includes(structure.id))
                && _.sum(structure.store) > MINIMUM_HAUL_CONTAINER_RESOURCE_AMOUNT;
        }
    });

    if (container.length === 0) {
        return ERR_NOT_FOUND;
    }

    return _.sortBy(container, s => this.pos.getRangeTo(s))[0];
};

Creep.prototype.findClosestDroppedResource = function() {
    let droppedEnergy = this.room.find(FIND_DROPPED_RESOURCES);

    if (droppedEnergy.length === 0) {
        return ERR_NOT_FOUND;
    }

    droppedEnergy = _.sortBy(droppedEnergy, s => this.pos.getRangeTo(s));
    return droppedEnergy[0];
};

Creep.prototype.findHighestDroppedResourceAboveHaulThreshold = function() {
    let droppedResources = this.room.find(FIND_DROPPED_RESOURCES, {
        filter: function(drop) {return drop.amount > MINIMUM_HAUL_RESOURCE_AMOUNT;}
    });

    if (droppedResources.length === 0) {
        return ERR_NOT_FOUND;
    }

    return _.sortBy(droppedResources, e => e.amount)[droppedResources.length - 1];
};

Creep.prototype.findClosestDroppedEnergy = function() {
    let droppedEnergy = this.room.find(FIND_DROPPED_RESOURCES, {
        filter: function(drop) {return drop.amount > MINIMUM_HAUL_RESOURCE_AMOUNT && drop.resourceType === RESOURCE_ENERGY;}
    });

    if (droppedEnergy.length === 0) {
        return ERR_NOT_FOUND;
    }

    droppedEnergy = _.sortBy(droppedEnergy, e => e.amount);
    return droppedEnergy[droppedEnergy.length - 1];
};

Creep.prototype.findClosestTombstone = function() {
    const tombstones = this.room.find(FIND_TOMBSTONES, {
        filter: (tomb) => {
            return tomb.store[RESOURCE_ENERGY] > 0;
        }
    });

    if (tombstones.length === 0) {
        return ERR_NOT_FOUND;
    }

    return _.sortBy(tombstones, s => this.pos.getRangeTo(s))[0];
};