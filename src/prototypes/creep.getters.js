// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~ private getters used by creeptasks ~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Creep.prototype._getSource = function() {
    if (this.memory.taskTargetId) {
        return Game.getObjectById(this.memory.taskTargetId);
    }

    let sources = this.room.getUnoccupiedSources();
    if (sources === ERR_NOT_FOUND)  {
        return ERR_NOT_FOUND;
    }

    let source = _.sortBy(sources, source => source.pos.getRangeTo(this))[0];

    source.memory.workersAssigned++;
    this.memory.taskTargetId = source.id;
    this.memory.containerId = source.memory.containerId;
    return source;
};

Creep.prototype._getEnergyStorage = function() {
    let structureThatRequiresEnergy;
    if (this.memory.taskTargetId) {
        structureThatRequiresEnergy = Game.getObjectById(this.memory.taskTargetId);
        if (structureThatRequiresEnergy.canStillStoreEnergy()) {
            return structureThatRequiresEnergy;
        }
    }

    structureThatRequiresEnergy = this.findClosestFreeEnergyStorage();

    if (structureThatRequiresEnergy === ERR_NOT_FOUND) {
        return ERR_NOT_FOUND;
    }

    this.memory.taskTargetId = structureThatRequiresEnergy.id;
    return structureThatRequiresEnergy;
};

Creep.prototype._getMineralStorage = function() {
    let mineralStorage = ERR_NOT_FOUND;
    if (this.memory.taskTargetId) {
        mineralStorage = Game.getObjectById(this.memory.taskTargetId);
        if (mineralStorage) {
            switch(mineralStorage.structureType) {
                case STRUCTURE_STORAGE:
                case STRUCTURE_TERMINAL:
                case STRUCTURE_LAB:
                    return mineralStorage;
            }
        }
    }

    mineralStorage = this.findMineralStorage();

    if (mineralStorage === ERR_NOT_FOUND) {
        return ERR_NOT_FOUND;
    }

    this.memory.taskTargetId = mineralStorage.id;
    return mineralStorage;
};

Creep.prototype._getConstructionSite = function() {
    if (this.memory.taskTargetId) {
        let previousTarget = Game.getObjectById(this.memory.taskTargetId);
        if (previousTarget !== null) {
            return previousTarget;
        }
    }

    let constructionSites = this.room.find(FIND_CONSTRUCTION_SITES, {
        filter: (c) => c.owner = 'Jacudibu'
    });

    if (constructionSites.length === 0) {
        return ERR_NOT_FOUND;
    }

    let spawns = this.room.mySpawns;
    if (spawns.length > 0) {
        // TODO: This is inefficient af, maybe do this only in the first few RCL-Levels? Or store the first 5 in memory?
        constructionSites.sort(function (constructionA, constructionB) {
            if (constructionA.structureType !== constructionB.structureType) {
                if (constructionA.structureType === STRUCTURE_STORAGE) {
                    return -1;
                }

                if (constructionB.structureType === STRUCTURE_STORAGE) {
                    return 1;
                }

                if (constructionA.structureType === STRUCTURE_EXTENSION) {
                    return -1;
                }
                if (constructionB.structureType === STRUCTURE_EXTENSION) {
                    return 1;
                }
            }

            let compareProgress = constructionB.progress - constructionA.progress;

            if (compareProgress === 0) {
                return constructionA.pos.getRangeTo(spawns[0]) - constructionB.pos.getRangeTo(spawns[0]);
            } else {
                return compareProgress;
            }
        });
    } else {
        // No spawn, just get the closest structure to our creep
        constructionSites = _.sortBy(constructionSites, site => site.pos.getRangeTo(this));
    }

    this.memory.taskTargetId = constructionSites[0].id;
    return constructionSites[0];
};

Creep.prototype._getDamagedStructure = function(percentageToCountAsDamaged = 0.75, sortByRange = false) {
    if (this.memory.taskTargetId) {
        let previousTarget = Game.getObjectById(this.memory.taskTargetId);

        // might have been destroyed by enemies or bulldozing players, so check its existence.
        if (previousTarget !== null) {
            if (previousTarget.hits < previousTarget.hitsMax) {
                return previousTarget;
            }
        }
    }

    let damagedStructures = this.room.find(FIND_STRUCTURES, {
        filter: structure => {

            if (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART) {
                return structure.hits < WALLS_REPAIR_MAX[this.room.controller.level];
            }

            if (structure.structureType === STRUCTURE_SPAWN) {
                return structure.hits < structure.hitsMax;
            }

            return structure.hits < structure.hitsMax * percentageToCountAsDamaged;
        }
    });

    if (sortByRange) {
        damagedStructures = _.sortBy(damagedStructures, c => c.pos.getRangeTo(this));
    } else {
        damagedStructures.sort((a,b) => {
            let diff = a.hits - b.hits;
            if (diff === 0) {
                return this.pos.getRangeTo(a) - this.pos.getRangeTo(b);
            }

            return a.hits - b.hits
        });
    }

    if(damagedStructures.length === 0) {
        return ERR_NOT_FOUND;
    }

    this.memory.taskTargetId = damagedStructures[0].id;
    return damagedStructures[0];
};

Creep.prototype._getEnergyHaulTarget = function() {
    if (this.memory.taskTargetId) {
        return Game.getObjectById(this.memory.taskTargetId);
    }

    let potentialTarget = this.findClosestDroppedEnergy();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.memory.taskTargetId = potentialTarget.id;
        this.memory.hauledResourceType = potentialTarget.resourceType;
        return potentialTarget;
    }

    potentialTarget = this.findClosestContainerAboveHaulThreshold();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.memory.taskTargetId = potentialTarget.id;
        if (potentialTarget.store[RESOURCE_ENERGY] > 0) {
            this.memory.hauledResourceType = RESOURCE_ENERGY;
            return potentialTarget;
        } else {
            if (this.carry[RESOURCE_ENERGY] === 0) {
                this.memory.hauledResourceType = Object.keys(potentialTarget.store).filter(name => name !== RESOURCE_ENERGY)[0];
                return potentialTarget;
            }
        }
    }

    if (this.room.controller.my) {
        return ERR_NOT_FOUND;
    }

    // Hostile structure looting!
    let hostileStructures = this.room.find(FIND_HOSTILE_STRUCTURES);
    for (let structure of hostileStructures) {
        if (structure.energy) {
            this.memory.taskTargetId = structure.id;
            this.memory.hauledResourceType = RESOURCE_ENERGY;
            return structure;
        }

        if (structure.store && structure.store[RESOURCE_ENERGY]) {
            this.memory.taskTargetId = structure.id;
            this.memory.hauledResourceType = RESOURCE_ENERGY;
            return structure;
        }
    }

    return ERR_NOT_FOUND;
};

Creep.prototype._getAnyResourceHaulTarget = function() {
    if (this.memory.taskTargetId) {
        return Game.getObjectById(this.memory.taskTargetId);
    }

    let potentialTarget = this.findHighestDroppedResourceAboveHaulThreshold();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.memory.taskTargetId = potentialTarget.id;
        this.memory.hauledResourceType = potentialTarget.resourceType;
        return potentialTarget;
    }

    potentialTarget = this.findClosestContainerAboveHaulThreshold();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.memory.taskTargetId = potentialTarget.id;
        if (potentialTarget.store[RESOURCE_ENERGY] > 0) {
            this.memory.hauledResourceType = RESOURCE_ENERGY;
            return potentialTarget;
        } else {
            if (this.carry[RESOURCE_ENERGY] === 0) {
                this.memory.hauledResourceType = Object.keys(potentialTarget.store).filter(name => name !== RESOURCE_ENERGY)[0];
                return potentialTarget;
            }
        }
    }

    if (this.room.labTask) {
        if (this.room.labTask === LABTASK.MAKE_EMPTY) {
            // Empty all of them
            for (let lab of this.room.labs) {
                if (lab.mineralType && lab.mineralAmount > 0) {
                    this.memory.taskTargetId = lab.id;
                    this.memory.hauledResourceType = lab.mineralType;
                    return lab;
                }
            }
        } else {
            // Fill Input
            for (let lab of this.room.inputLabs) {
                if (lab.requestedMineral != null && lab.mineralAmount < 500) {
                    if (this.room.terminal.store[lab.requestedMineral] > 0) {
                        this.memory.taskTargetId = this.room.terminal.id;
                        this.memory.hauledResourceType = lab.requestedMineral;
                        return this.room.terminal;
                    } else if (this.room.storage.store[lab.requestedMineral] > 0) {
                        this.memory.taskTargetId = this.room.storage.id;
                        this.memory.hauledResourceType = lab.requestedMineral;
                        return this.room.storage;
                    }
                }
            }

            // Empty Output
            for (let lab of this.room.outputLabs) {
                if (lab.mineralType && (lab.mineralAmount > MINIMUM_HAUL_RESOURCE_AMOUNT)) {
                    this.memory.taskTargetId = lab.id;
                    this.memory.hauledResourceType = lab.mineralType;
                    return lab;
                }
            }
        }
    }

    potentialTarget = this.findClosestDroppedResource();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.memory.taskTargetId = potentialTarget.id;
        this.memory.hauledResourceType = potentialTarget.resourceType;
        return potentialTarget;
    }

    if (this.room.terminal) {
        if (this.room.terminal.store[RESOURCE_ENERGY] > TERMINAL_MIN_ENERGY_STORAGE_FOR_HAULER_RETRIEVAL) {
            this.memory.taskTargetId = this.room.terminal.id;
            this.memory.hauledResourceType = RESOURCE_ENERGY;
            return this.room.terminal;
        }
    }

    potentialTarget = this.findClosestTombstone();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.memory.taskTargetId = potentialTarget.id;
        this.memory.hauledResourceType = RESOURCE_ENERGY;
        return potentialTarget;
    }

    if (this.room.storage) {
        if (this.room.storage.store[RESOURCE_ENERGY] > 0) {
            this.memory.taskTargetId = this.room.storage.id;
            this.memory.hauledResourceType = RESOURCE_ENERGY;
            return this.room.storage;
        }
    }

    return ERR_NOT_FOUND;
};

Creep.prototype._getDismantleTarget = function() {
    if (this.memory.taskTargetId) {
        let target = Game.getObjectById(this.memory.taskTargetId);
        if (target != null) {
            return target;
        }
    }

    let enemyStructures = this.room.find(FIND_HOSTILE_STRUCTURES, {
        filter: (structure) => structure.structureType !== STRUCTURE_RAMPART
    });
    if (enemyStructures.length > 0) {
        let target = _.sortBy(enemyStructures, site => site.pos.getRangeTo(this))[0];
        this.memory.taskTargetId = target.id;
        return target;
    }

    let flags = this.room.find(FIND_FLAGS, {
        filter: (flag) => this.room.lookForAt(LOOK_STRUCTURES, flag.pos)
    });
    if (flags.length > 0) {
        let flag = _.sortBy(flags, flag => flag.pos.getRangeTo(this))[0];
        let target = this.room.lookForAt(LOOK_STRUCTURES, flag.pos)[0];
        flag.remove();

        this.memory.taskTargetId = target.id;
        return target;
    }

    return undefined;
};