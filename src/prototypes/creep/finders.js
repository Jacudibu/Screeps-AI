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

    if (this.room.controllerLink) {
        if (this.room.controllerLink.energy >= this.carryCapacity) {
            energyStorages.push(this.room.controllerLink)
        }
    }

    if (this.room.storageLink) {
        if(this.room.storageLink.energy >= this.carryCapacity) {
            energyStorages.push(this.room.storageLink);
        }
    }

    if (energyStorages.length === 0) {
        return ERR_NOT_FOUND;
    }

    return utility.getClosestObjectFromArray(this, energyStorages);
};

Creep.prototype.findClosestFilledEnergyStorage = function() {
    const filledEnergyStorages = [];

    if (this.room.containers) {
        this.room.containers.map(container => {
            if (container && container.store[RESOURCE_ENERGY] >= this.carryCapacity) {
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

    if (this.room.controllerLink) {
        if (this.room.controllerLink.energy >= this.carryCapacity) {
            filledEnergyStorages.push(this.room.controllerLink)
        }
    }

    if (this.room.storageLink) {
        if(this.room.storageLink.energy >= this.carryCapacity) {
            filledEnergyStorages.push(this.room.storageLink);
        }
    }

    if (filledEnergyStorages.length === 0) {
        return ERR_NOT_FOUND;
    }

    return utility.getClosestObjectFromArray(this, filledEnergyStorages);
};

Creep.prototype.findClosestFreeEnergyStorage = function() {
    let spawns = this.room.mySpawns.filter(spawn => spawn.energy < spawn.energyCapacity);
    if (spawns.length > 0) {
        return utility.getClosestObjectFromArray(this, spawns);
    }

    let extension = this.room.getClosestEmptyExtensionToPosition(this, this.carry[RESOURCE_ENERGY]);
    if (extension !== ERR_NOT_FOUND) {
        return extension;
    }

    let towers = this.room.myTowers.filter(tower => tower.energy < tower.energyCapacity);
    if (towers.length > 0) {
        return utility.getClosestObjectFromArray(this, towers);
    }

    let publicEnergyContainers = this.room.getEmptyPublicEnergyContainers();
    if (publicEnergyContainers !== ERR_NOT_FOUND) {
        return utility.getClosestObjectFromArray(this, publicEnergyContainers);
    }

    if (!this.room.shouldEvacuate) {
        let labs = this.room.labs;
        if (labs && labs.length > 0) {
            let labsThatNeedEnergy = labs.filter(lab => lab.energy < lab.energyCapacity);
            if (labsThatNeedEnergy && labsThatNeedEnergy.length > 0) {
                return labsThatNeedEnergy[0];
            }
        }

        if (this.room.powerSpawn) {
            if (this.room.powerSpawn.energy < this.room.powerSpawn.energyCapacity) {
                return this.room.powerSpawn;
            }
        }

        if (this.room.nuker) {
            if (this.room.nuker.energy < this.room.nuker.energyCapacity) {
                return this.room.nuker;
            }
        }

        let storage = this.room.storage;
        if (storage && storage.my) {
            // Substracting this.carryCapacity so creeps won't infinitely haul & store energy to the same structure
            if (storage.store[RESOURCE_ENERGY] < (STORAGE_MAX[RESOURCE_ENERGY] - (this.carryCapacity * 2))) {
                return storage;
            }
        }

        if (this.room.terminal && this.room.terminal.my) {
            // Substracting this.carryCapacity so creeps won't infinitely haul & store energy to the same structure
            if (this.room.terminal.store[RESOURCE_ENERGY] < (TERMINAL_MAX_ENERGY_STORAGE - this.carryCapacity)) {
                return this.room.terminal;
            }
        }
    }

    if (this.room.terminal && this.room.terminal.my) {
        if (_.sum(this.room.terminal.store) < TERMINAL_CAPACITY) {
            return this.room.terminal;
        }
    }

    return ERR_NOT_FOUND;
};

Creep.prototype.findMineralStorage = function(resourceType) {
    if (this.room.inputLabs.length > 0) {
        for (let lab of this.room.inputLabs) {
            if ( (!lab.mineralType || lab.mineralType === resourceType)
                && lab.requestedMineral === resourceType
                && lab.mineralAmount < lab.mineralCapacity) {
                return lab;
            }
        }
    }

    if (!this.room.shouldEvacuate) {
        if (resourceType === RESOURCE_GHODIUM) {
            if (this.room.nuker && this.room.nuker.ghodium < this.room.nuker.ghodiumCapacity) {
                return this.room.nuker;
            }
        }

        if (resourceType === RESOURCE_POWER) {
            if (this.room.powerSpawn && this.room.powerSpawn.power < this.room.powerSpawn.powerCapacity) {
                return this.room.powerSpawn;
            }
        }

        if (this.room.storage && this.room.storage.my) {
            if (!this.room.storage.store[resourceType] || this.room.storage.store[resourceType] < STORAGE_MAX[resourceType]) {
                return this.room.storage;
            }
        }
    }

    if (this.room.terminal && this.room.terminal.my) {
        return this.room.terminal;
    }

    if (!this.room.shouldEvacuate) {
        if (this.room.storage && this.room.storage.my) {
            return this.room.storage;
        }
    }

    return ERR_NOT_FOUND;
};

Creep.prototype.findClosestContainerAboveHaulThreshold = function() {
    if (this.room.containers.length === 0) {
        return ERR_NOT_FOUND;
    }

    const containers = this.room.containers.filter((container) => {
            return container
                && container.isNextToSourceOrMineral
                && _.sum(container.store) > CONTAINER_MINIMUM_HAUL_RESOURCE_AMOUNT;
        }
    );

    if (containers.length === 0) {
        return ERR_NOT_FOUND;
    }

    return utility.getClosestObjectFromArray(this, containers);
};

Creep.prototype.findClosestDroppedResource = function() {
    let droppedEnergy = this.room.find(FIND_DROPPED_RESOURCES);

    if (droppedEnergy.length === 0) {
        return ERR_NOT_FOUND;
    }

    return utility.getClosestObjectFromArray(this, droppedEnergy);
};

Creep.prototype.findHighestDroppedResourceAboveHaulThreshold = function() {
    let droppedResources = this.room.find(FIND_DROPPED_RESOURCES, {
        filter: function(drop) {return drop.amount > RESOURCE_MINIMUM_HAUL_AMOUNT;}
    });

    if (droppedResources.length === 0) {
        return ERR_NOT_FOUND;
    }

    return _.sortBy(droppedResources, e => e.amount)[droppedResources.length - 1];
};

Creep.prototype.findClosestDroppedEnergy = function() {
    let droppedEnergy = this.room.find(FIND_DROPPED_RESOURCES, {
        filter: function(drop) {return drop.amount > RESOURCE_MINIMUM_HAUL_AMOUNT && drop.resourceType === RESOURCE_ENERGY;}
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

    return utility.getClosestObjectFromArray(this, tombstones);
};