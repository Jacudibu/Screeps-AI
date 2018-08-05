// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~ finder functions for various things not yet implemented elesewhere ~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Creep.prototype.findClosestFilledEnergyStructure = function() {
    const storages = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.canReleaseEnergy(50);
        }
    });

    if (storages.length === 0) {
        return ERR_NOT_FOUND;
    }

    return _.sortBy(storages, s => this.pos.getRangeTo(s))[0];
};

Creep.prototype.findClosestFilledContainerOrStorage = function() {
    const storages = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.isEnergyStorageOrContainer() && structure.canReleaseEnergy(50);
        }
    });

    if (storages.length === 0) {
        return ERR_NOT_FOUND;
    }

    return _.sortBy(storages, s => this.pos.getRangeTo(s))[0];
};

Creep.prototype.findClosestFreeEnergyStorage = function() {
    let structuresThatRequireEnergy = this.room.getFreeSpawnsTowersOrExtensions();

    if (structuresThatRequireEnergy !== ERR_NOT_FOUND) {
        return _.sortBy(structuresThatRequireEnergy, s => this.pos.getRangeTo(s))[0];
    }

    let closestPublicRoomContainer = this.findClosestPublicRoomContainer();
    if (closestPublicRoomContainer !== ERR_NOT_FOUND) {
        return closestPublicRoomContainer;
    }

    let storage = this.room.storage;
    if (storage) {
        if (_.sum(storage.store) < storage.storeCapacity) {
            return storage;
        }
    }

    return ERR_NOT_FOUND;
};

Creep.prototype.findClosestPublicRoomContainer = function() {
    const publicEnergyContainer = this.room.getPublicEnergyContainers();

    const container = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType === STRUCTURE_CONTAINER
                && publicEnergyContainer && publicEnergyContainer.includes(structure.id)
                && _.sum(structure.store) < structure.storeCapacity);
        }
    });

    if (container.length === 0) {
        return ERR_NOT_FOUND;
    }

    return _.sortBy(container, c => this.pos.getRangeTo(c))[0];
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

Creep.prototype.findClosestDroppedEnergy = function() {
    let droppedEnergy = this.room.find(FIND_DROPPED_RESOURCES);

    if (droppedEnergy.length === 0) {
        return ERR_NOT_FOUND;
    }

    droppedEnergy = _.sortBy(droppedEnergy, s => this.pos.getRangeTo(s));
    return droppedEnergy[0];
};

Creep.prototype.findHighestDroppedEnergyAboveHaulThreshold = function() {
    let droppedEnergy = this.room.find(FIND_DROPPED_RESOURCES, {
        filter: function(drop) {return drop.amount > MINIMUM_HAUL_RESOURCE_AMOUNT;}
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