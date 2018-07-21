Creep.prototype.setTask = function(task) {
    this.memory.taskTargetId = undefined;
    this.memory.task = task;
};

Creep.prototype.resetCurrentTask = function() {
    this.memory.taskTargetId = undefined;
};

Creep.prototype.isRenewNeeded = function() {
    if (this.memory.shouldRespawn && this.ticksToLive < CRITICAL_TICKS_TO_LIVE_VALUE) {
        if (this.memory.tier >= Math.floor(this.room.energyCapacityAvailable / COST_PER_WORKER_TIER)) {
            return true;
        }
    } else {
        return false;
    }
};

Creep.prototype.countBodyPartsOfType = function(types) {
    return _.filter(this.body, function(bodyPart) {return bodyPart.type === types}).length;
};

Creep.prototype.findClosestFilledEnergyStorage = function() {
    const storages = this.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return structure.canReleaseEnergy(this.carryCapacity);
        }
    });

    if (storages.length === 0) {
        return undefined;
    }

    return _.sortBy(storages, s => this.pos.getRangeTo(s))[0];
};

Creep.prototype.findClosestFreeEnergyStorage = function() {
    const structuresThatRequireEnergy = this.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return structure.canStoreEnergy(1);
        }
    });

    if (structuresThatRequireEnergy.length === 0) {
        return undefined;
    }

    return _.sortBy(structuresThatRequireEnergy, s => this.pos.getRangeTo(s))[0];
};

Creep.prototype.findClosestAvailableResource = function() {
    return this.pos.findClosestByRange(FIND_SOURCES, {filter: function(source) {
            return source.memory.workersAssigned < source.memory.workersMax;
        }});
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~ private getters used by tasks ~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Creep.prototype._getSource = function() {
    if (this.memory.taskTargetId) {
        return Game.getObjectById(this.memory.taskTargetId);
    }

    let source = this.findClosestAvailableResource();

    if (source == null)  {
        return ERR_NOT_FOUND;
    }

    source.memory.workersAssigned++;
    this.memory.taskTargetId = source.id;
    return source;
};

Creep.prototype._getStorage = function() {
    if (this.memory.taskTargetId) {
        return Game.getObjectById(this.memory.taskTargetId);
    }

    const structureThatRequiresEnergy = this.findClosestFreeEnergyStorage();

    if (structureThatRequiresEnergy === undefined) {
        return ERR_NOT_FOUND;
    }

    this.memory.taskTargetId = structureThatRequiresEnergy.id;
    return structureThatRequiresEnergy;
};

Creep.prototype._getConstructionSite = function() {
    if (this.memory.taskTargetId) {
        return Game.getObjectById(this.memory.taskTargetId);
    }

    let constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);

    if (constructionSites.length === 0) {
        return ERR_NOT_FOUND;
    }

    constructionSites.sort(function(constructionA, constructionB) {
        if (constructionA.structureType !== constructionB.structureType) {
            if (constructionA.structureType === STRUCTURE_EXTENSION) {
                return -1;
            }
            if (constructionB.structureType === STRUCTURE_EXTENSION) {
                return 1;
            }
        }

        let compareProgress = constructionB.progress - constructionA.progress;

        if (compareProgress === 0) {
            // return the one closer to spawn
            // TODO: This is inefficient af, maybe do this only in the first few RCL-Levels? Or store the first 5 in memory?
            let spawn = constructionA.room.find(FIND_MY_SPAWNS)[0];
            return constructionA.pos.getRangeTo(spawn) - constructionB.pos.getRangeTo(spawn);
        } else {
            return compareProgress;
        }
    });

    this.memory.taskTargetId = constructionSites[0].id;
    return constructionSites[0];
};

Creep.prototype._getDamagedStructure = function() {
    if (this.memory.taskTargetId) {
        let previousTarget = Game.getObjectById(this.memory.taskTargetId);

        if (previousTarget.hits < previousTarget.hitsMax) {
            return previousTarget;
        }
    }

    const damagedStructures = this.room.find(FIND_STRUCTURES, {
        filter: structure => structure.hits < structure.hitsMax / 3
    });

    damagedStructures.sort((a,b) => a.hits - b.hits);

    if(damagedStructures.length === 0) {
        return ERR_NOT_FOUND;
    }

    this.memory.taskTargetId = damagedStructures[0].id;
    return damagedStructures[0];
};