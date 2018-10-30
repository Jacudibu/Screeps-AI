// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~ private getters used by creeptasks ~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Creep.prototype._getSource = function() {
    if (this.taskTargetId) {
        return Game.getObjectById(this.taskTargetId);
    }

    let sources = this.room.getUnoccupiedSources();
    if (sources === ERR_NOT_FOUND)  {
        return ERR_NOT_FOUND;
    }

    let source = utility.getClosestObjectFromArray(this, sources);

    source.memory.workersAssigned++;
    this.taskTargetId = source.id;
    return source;
};

Creep.prototype._getEnergyStorage = function() {
    let structureThatRequiresEnergy;
    if (this.taskTargetId) {
        structureThatRequiresEnergy = Game.getObjectById(this.taskTargetId);
        if (structureThatRequiresEnergy) {
            if (structureThatRequiresEnergy.canStillStoreEnergy()) {
                return structureThatRequiresEnergy;
            }
        }
    }

    structureThatRequiresEnergy = this.findClosestFreeEnergyStorage();

    if (structureThatRequiresEnergy === ERR_NOT_FOUND) {
        return ERR_NOT_FOUND;
    }

    this.taskTargetId = structureThatRequiresEnergy.id;
    return structureThatRequiresEnergy;
};

Creep.prototype._getMineralStorage = function(resourceType) {
    let mineralStorage = ERR_NOT_FOUND;
    if (this.taskTargetId) {
        mineralStorage = Game.getObjectById(this.taskTargetId);
        if (mineralStorage) {
            switch(mineralStorage.structureType) {
                case STRUCTURE_STORAGE:
                case STRUCTURE_TERMINAL:
                    return mineralStorage;
                case STRUCTURE_LAB:
                    if (   mineralStorage.requestedMineral === resourceType
                        && (!mineralStorage.mineralType || mineralStorage.mineralType === resourceType)
                        && mineralStorage.mineralAmount < mineralStorage.mineralCapacity) {
                        return mineralStorage;
                    }
                    break;
                case STRUCTURE_NUKER:
                    if (resourceType !== RESOURCE_GHODIUM) {
                        break;
                    }

                    if (mineralStorage.ghodium < mineralStorage.ghodiumCapacity) {
                        return mineralStorage;
                    }
                    break;
                case STRUCTURE_POWER_SPAWN:
                    if (resourceType !== RESOURCE_POWER) {
                        break;
                    }

                    if (mineralStorage.power < mineralStorage.powerCapacity) {
                        return mineralStorage;
                    }
                    break;
            }
        }
    }

    mineralStorage = this.findMineralStorage(resourceType);

    if (mineralStorage === ERR_NOT_FOUND) {
        return ERR_NOT_FOUND;
    }

    this.taskTargetId = mineralStorage.id;
    return mineralStorage;
};

Creep.prototype._getConstructionSite = function() {
    if (this.taskTargetId) {
        let previousTarget = Game.getObjectById(this.taskTargetId);
        if (previousTarget !== null) {
            return previousTarget;
        }
    }

    let constructionSites = this.room.find(FIND_MY_CONSTRUCTION_SITES);

    if (constructionSites.length === 0) {
        switch (this.room.requestNewConstructionSite()) {
            case OK:
                return ERR_CONSTRUCTION_WILL_BE_PLACED_NEXT_TICK;
            default:
                return ERR_NOT_FOUND;
        }
    }

    let spawns = this.room.mySpawns;
    if (spawns.length > 0) {
        // TODO: This is inefficient af, maybe do this only in the first few RCL-Levels? Or store the first 5 in memory?
        constructionSites.sort(function (constructionA, constructionB) {
            if (constructionA.structureType !== constructionB.structureType) {
                if (constructionA.structureType === STRUCTURE_SPAWN) {
                    return -1;
                }

                if (constructionB.structureType === STRUCTURE_SPAWN) {
                    return 1;
                }

                if (constructionA.structureType === STRUCTURE_EXTENSION) {
                    return -1;
                }

                if (constructionB.structureType === STRUCTURE_EXTENSION) {
                    return 1;
                }

                if (constructionA.structureType === STRUCTURE_STORAGE) {
                    return -1;
                }

                if (constructionB.structureType === STRUCTURE_STORAGE) {
                    return 1;
                }

                if (constructionA.structureType === STRUCTURE_TERMINAL) {
                    return -1;
                }

                if (constructionB.structureType === STRUCTURE_TERMINAL) {
                    return 1;
                }

                if (constructionA.structureType === STRUCTURE_TOWER) {
                    return -1;
                }

                if (constructionB.structureType === STRUCTURE_TOWER) {
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
        // No spawn, so check if we can build one!
        let spawnSites = constructionSites.filter(site => site.structureType === STRUCTURE_SPAWN);
        if (spawnSites.length > 0) {
            // yippieeeh!
            constructionSites = spawnSites;
        } else {
            // :(
            // just get the closest structure to our creep then, lol.
            constructionSites = [utility.getClosestObjectFromArray(this, constructionSites)];
        }
    }

    this.taskTargetId = constructionSites[0].id;
    return constructionSites[0];
};

Creep.prototype._getDamagedStructure = function(percentageToCountAsDamaged = 0.75, sortByRange = false) {
    if (this.taskTargetId) {
        let previousTarget = Game.getObjectById(this.taskTargetId);

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
                if (percentageToCountAsDamaged > 0.5) {
                    return structure.hits < WALLS_REPAIR_MAX[this.room.controller.level];
                } else {
                    return structure.hits < WALLS_REPAIR_MAX[this.room.controller.level] * percentageToCountAsDamaged;
                }
            }

            if (structure.structureType === STRUCTURE_SPAWN) {
                return structure.hits < structure.hitsMax;
            }

            return structure.hits < structure.hitsMax * percentageToCountAsDamaged;
        }
    });

    if(damagedStructures.length === 0) {
        return ERR_NOT_FOUND;
    }

    if (sortByRange) {
        damagedStructures = [utility.getClosestObjectFromArray(this, damagedStructures)];
    } else {
        damagedStructures.sort((a,b) => {
            let diff = a.hits - b.hits;
            if (diff === 0) {
                return this.pos.getRangeTo(a) - this.pos.getRangeTo(b);
            }

            return a.hits - b.hits
        });
    }

    this.taskTargetId = damagedStructures[0].id;
    return damagedStructures[0];
};

Creep.prototype._getEnergyHaulTarget = function() {
    if (this.taskTargetId) {
        let potentialTarget = Game.getObjectById(this.taskTargetId);

        if (potentialTarget) {
            if (potentialTarget.store && potentialTarget.store[RESOURCE_ENERGY] > CONTAINER_MINIMUM_HAUL_RESOURCE_AMOUNT) {
                return potentialTarget;
            }

            if (potentialTarget.amount && potentialTarget.amount > RESOURCE_MINIMUM_HAUL_AMOUNT) {
                return potentialTarget;
            }

            if (potentialTarget.energy > 100) {
                // spawns & links
                return potentialTarget;
            }
        }
    }

    let potentialTarget = this.findClosestDroppedEnergy();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.taskTargetId = potentialTarget.id;
        this.hauledResourceType = potentialTarget.resourceType;
        return potentialTarget;
    }

    potentialTarget = this.findClosestContainerAboveHaulThreshold();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.taskTargetId = potentialTarget.id;
        if (potentialTarget.store[RESOURCE_ENERGY] > 0) {
            this.hauledResourceType = RESOURCE_ENERGY;
            return potentialTarget;
        } else {
            if (this.carry[RESOURCE_ENERGY] === 0) {
                this.hauledResourceType = Object.keys(potentialTarget.store).filter(name => name !== RESOURCE_ENERGY)[0];
                return potentialTarget;
            }
        }
    }

    if (this.room.storageLink && this.room.storageLink.energy > 700) {
        this.taskTargetId = this.room.storageLink.id;
        this.hauledResourceType = RESOURCE_ENERGY;
        return this.room.storageLink;
    }

    // TODO: Check if hostile structures length === 0 instead
    if (this.room.controller.my) {
        return ERR_NOT_FOUND;
    }

    // Hostile structure looting!
    let hostileStructures = this.room.find(FIND_HOSTILE_STRUCTURES);
    for (let structure of hostileStructures) {
        if (structure.energy) {
            this.taskTargetId = structure.id;
            this.hauledResourceType = RESOURCE_ENERGY;
            return structure;
        }

        if (structure.store && structure.store[RESOURCE_ENERGY]) {
            this.taskTargetId = structure.id;
            this.hauledResourceType = RESOURCE_ENERGY;
            return structure;
        }
    }

    return ERR_NOT_FOUND;
};

Creep.prototype._getAnyResourceHaulTargetInOwnedRoom = function() {
    if (this.taskTargetId) {
        let potentialTarget = Game.getObjectById(this.taskTargetId);

        if (potentialTarget && this.hauledResourceType === RESOURCE_ENERGY) {
            if (potentialTarget.store && potentialTarget.store[RESOURCE_ENERGY] > CONTAINER_MINIMUM_HAUL_RESOURCE_AMOUNT) {
                return potentialTarget;
            }

            if (potentialTarget.amount && potentialTarget.amount > RESOURCE_MINIMUM_HAUL_AMOUNT) {
                return potentialTarget;
            }

            if (potentialTarget.energy > 100) {
                // spawns & links
                return potentialTarget;
            }
        }
    }

    let potentialTarget = this.findHighestDroppedResourceAboveHaulThreshold();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.taskTargetId = potentialTarget.id;
        this.hauledResourceType = potentialTarget.resourceType;
        return potentialTarget;
    }

    potentialTarget = this.findClosestContainerAboveHaulThreshold();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.taskTargetId = potentialTarget.id;
        if (potentialTarget.store[RESOURCE_ENERGY] > 0) {
            this.hauledResourceType = RESOURCE_ENERGY;
            return potentialTarget;
        } else {
            if (this.carry[RESOURCE_ENERGY] === 0) {
                this.hauledResourceType = Object.keys(potentialTarget.store).filter(name => name !== RESOURCE_ENERGY)[0];
                return potentialTarget;
            }
        }
    }

    if (this.room.storageLink && this.room.storageLink.energy > 700) {
        this.taskTargetId = this.room.storageLink.id;
        this.hauledResourceType = RESOURCE_ENERGY;
        return this.room.storageLink;
    }

    if (this.room.labTask) {
        if (this.room.labTask === LABTASK.MAKE_EMPTY) {
            // Empty all of them
            for (let lab of this.room.labs) {
                if (lab.mineralType && lab.mineralAmount > 0) {
                    this.taskTargetId = lab.id;
                    this.hauledResourceType = lab.mineralType;
                    return lab;
                }
            }
        } else if (this.room.labTask === LABTASK.RUN_REACTION) {
            // Fill Input
            for (let lab of this.room.inputLabs) {
                if (lab.requestedMineral != null && lab.mineralAmount < 500) {
                    if (this.room.terminal.store[lab.requestedMineral] > 0) {
                        this.taskTargetId = this.room.terminal.id;
                        this.hauledResourceType = lab.requestedMineral;
                        return this.room.terminal;
                    } else if (this.room.storage.store[lab.requestedMineral] > 0) {
                        this.taskTargetId = this.room.storage.id;
                        this.hauledResourceType = lab.requestedMineral;
                        return this.room.storage;
                    }
                }
            }

            // Empty Output
            for (let lab of this.room.outputLabs) {
                if (lab.mineralType && (lab.mineralAmount > LAB_OUTPUT_MINIMUM_HAUL_AMOUNT)) {
                    this.taskTargetId = lab.id;
                    this.hauledResourceType = lab.mineralType;
                    return lab;
                }
            }
        }
    }

    if (this.room.nuker && !this.room.shouldEvacuate) {
        if (this.room.nuker.ghodium < this.room.nuker.ghodiumCapacity) {
            if (this.room.terminal.store[RESOURCE_GHODIUM] && this.room.terminal.store[RESOURCE_GHODIUM] > 0) {
                this.taskTargetId = this.room.terminal.id;
                this.hauledResourceType = RESOURCE_GHODIUM;
                return this.room.terminal;
            }

            if (this.room.storage.store[RESOURCE_GHODIUM] && this.room.storage.store[RESOURCE_GHODIUM] > 0) {
                this.taskTargetId = this.room.storage.id;
                this.hauledResourceType = RESOURCE_GHODIUM;
                return this.room.storage;
            }
        }
    }

    potentialTarget = this.findClosestTombstone();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.taskTargetId = potentialTarget.id;
        this.hauledResourceType = RESOURCE_ENERGY;
        return potentialTarget;
    }

    potentialTarget = this.findClosestDroppedResource();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.taskTargetId = potentialTarget.id;
        this.hauledResourceType = potentialTarget.resourceType;
        return potentialTarget;
    }

    if (this.room.powerSpawn && this.room.powerSpawn.power < this.room.powerSpawn.powerCapacity) {
        if (this.room.terminal && this.room.terminal.store[RESOURCE_POWER]) {
            this.taskTargetId = this.room.terminal.id;
            this.hauledResourceType = RESOURCE_POWER;
            return this.room.terminal;
        }

        if (this.room.storage && this.room.storage.store[RESOURCE_POWER]) {
            this.taskTargetId = this.room.storage.id;
            this.hauledResourceType = RESOURCE_POWER;
            return this.room.storage;
        }
    }

    // Haul Storage -> Terminal if storage is full
    if (this.room.storage) {
        for (let resource of RESOURCES_ALL) {
            if (!this.room.storage.store[resource]) {
                continue;
            }

            const maxStorage = this.room.shouldEvacuate ? 0 : (STORAGE_MAX[resource] + this.carryCapacity);
            if (this.room.storage.store[resource] > maxStorage) {
                this.taskTargetId = this.room.storage.id;
                this.hauledResourceType = resource;
                return this.room.storage;
            }
        }
    }

    if (!this.room.shouldEvacuate) {
        // Haul Terminal -> Storage if storage is not full
        if (this.room.terminal && this.room.storage) {
            for (let resource of RESOURCES_ALL) {
                if (!this.room.terminal.store[resource]) {
                    continue;
                }

                if (!this.room.storage.store[resource] || this.room.storage.store[resource] < STORAGE_MAX[resource] - this.carryCapacity) {
                    this.taskTargetId = this.room.terminal.id;
                    this.hauledResourceType = resource;
                    return this.room.terminal;
                }
            }
        }

        // Just haul energy, and do something with it (worst case it will just dump it back in afterwards)
        if (this.room.storage) {
            if (this.room.storage.store[RESOURCE_ENERGY] > 0) {
                this.taskTargetId = this.room.storage.id;
                this.hauledResourceType = RESOURCE_ENERGY;
                return this.room.storage;
            }
        }

        // If storage is empty and terminal has energy, something has gone wrong - so let our haulers fix that.
        if (this.room.terminal) {
            if (this.room.terminal.store[RESOURCE_ENERGY] > 0) {
                this.taskTargetId = this.room.terminal.id;
                this.hauledResourceType = RESOURCE_ENERGY;
                return this.room.terminal;
            }
        }
    }

    // TODO: Check if hostile structures length === 0 instead
    if (this.room.controller.my) {
        return ERR_NOT_FOUND;
    }

    // Hostile structure looting!
    let hostileStructures = this.room.find(FIND_HOSTILE_STRUCTURES);
    for (let structure of hostileStructures) {
        // spawns etc
        if (structure.energy) {
            this.taskTargetId = structure.id;
            this.hauledResourceType = RESOURCE_ENERGY;
            return structure;
        }

        // Labs
        if (structure.mineralAmount) {
            this.taskTargetId = structure.id;
            this.hauledResourceType = structure.mineralType;
            return structure;
        }

        // storage & terminal
        if (structure.store && structure.store[RESOURCE_ENERGY]) {
            this.taskTargetId = structure.id;
            this.hauledResourceType = RESOURCE_ENERGY;
            return structure;
        }
    }

    return ERR_NOT_FOUND;
};

Creep.prototype._getAnyResourceHaulTargetInRemoteRoom = function() {
    if (this.taskTargetId) {
        let potentialTarget = Game.getObjectById(this.taskTargetId);

        if (potentialTarget && this.hauledResourceType === RESOURCE_ENERGY) {
            if (potentialTarget.store && potentialTarget.store[RESOURCE_ENERGY] > CONTAINER_MINIMUM_HAUL_RESOURCE_AMOUNT) {
                return potentialTarget;
            }

            if (potentialTarget.amount && potentialTarget.amount > RESOURCE_MINIMUM_HAUL_AMOUNT) {
                return potentialTarget;
            }

            if (potentialTarget.energy > 100) {
                // spawns & links
                return potentialTarget;
            }
        }
    }

    let potentialTarget = this.findHighestDroppedResourceAboveHaulThreshold();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.taskTargetId = potentialTarget.id;
        this.hauledResourceType = potentialTarget.resourceType;
        return potentialTarget;
    }

    potentialTarget = this.findClosestContainerAboveHaulThreshold();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.taskTargetId = potentialTarget.id;
        if (potentialTarget.store[RESOURCE_ENERGY] > 0) {
            this.hauledResourceType = RESOURCE_ENERGY;
            return potentialTarget;
        } else {
            if (this.carry[RESOURCE_ENERGY] === 0) {
                this.hauledResourceType = Object.keys(potentialTarget.store).filter(name => name !== RESOURCE_ENERGY)[0];
                return potentialTarget;
            }
        }
    }

    potentialTarget = this.findClosestTombstone();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.taskTargetId = potentialTarget.id;
        this.hauledResourceType = RESOURCE_ENERGY;
        return potentialTarget;
    }

    // Hostile structure looting!
    let hostileStructures = this.room.find(FIND_HOSTILE_STRUCTURES);
    for (let structure of hostileStructures) {
        // spawns etc
        if (structure.energy) {
            this.taskTargetId = structure.id;
            this.hauledResourceType = RESOURCE_ENERGY;
            return structure;
        }

        // Labs
        if (structure.mineralAmount) {
            this.taskTargetId = structure.id;
            this.hauledResourceType = structure.mineralType;
            return structure;
        }

        // TODO: use remoteHaulTargetRoom once that is cached as well
        if (this.spawnRoom && Game.rooms[this.spawnRoom].terminal) {
            // Steal precious resources!
            // storage & terminal
            if (structure.store) {
                const storedResources = Object.keys(structure.store);
                for (const resource of storedResources) {
                    if (structure.store[resource]) {
                        this.taskTargetId = structure.id;
                        this.hauledResourceType = resource;
                        return structure;
                    }
                }
            }

            // Nuker
            if (structure.ghodium) {
                this.taskTargetId = structure.id;
                this.hauledResourceType = RESOURCE_GHODIUM;
                return structure;
            }
        } else {
            // Just steal energy
            if (structure.store) {
                if (structure.store[RESOURCE_ENERGY]) {
                    this.taskTargetId = structure.id;
                    this.hauledResourceType = RESOURCE_ENERGY;
                    return structure;
                }
            }
        }
    }

    potentialTarget = this.findClosestDroppedResource();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.taskTargetId = potentialTarget.id;
        this.hauledResourceType = potentialTarget.resourceType;
        return potentialTarget;
    }

    return ERR_NOT_FOUND;
};


Creep.prototype._getDismantleTarget = function() {
    if (this.taskTargetId) {
        let target = Game.getObjectById(this.taskTargetId);
        if (target != null && target instanceof Structure) {
            return target;
        }
    }

    let flags = this.room.find(FIND_FLAGS, {
        filter:
            flag => flag.color === COLOR_WHITE
                 && flag.secondaryColor === COLOR_WHITE
                 && this.room.lookForAt(LOOK_STRUCTURES, flag.pos).length > 0
    });
    if (flags.length > 0) {
        let flag = utility.getClosestObjectFromArray(this, flags);

        let target = this.room.lookForAt(LOOK_STRUCTURES, flag.pos)[0];
        flag.remove();

        if (target) {
            this.taskTargetId = target.id;
            return target;
        }
    }

    let enemyStructures = this.room.find(FIND_HOSTILE_STRUCTURES, {
        filter: structure => structure.structureType !== STRUCTURE_RAMPART
                          && structure.structureType !== STRUCTURE_WALL
                          && (!structure.store || _.sum(structure.store) < 5000)
    });
    if (enemyStructures.length > 0) {
        let target = utility.getClosestObjectFromArray(this, enemyStructures);
        this.taskTargetId = target.id;
        return target;
    }

    return ERR_NOT_FOUND;
};

Creep.prototype._getClosestHostileConstructionSite = function() {
    let target;
    if (this.taskTargetId) {
        target = Game.getObjectById(this.taskTargetId);
        if (target && target instanceof ConstructionSite && !target.my) {
            return target;
        }
    }

    const hostileConstructionSites = this.room.find(FIND_HOSTILE_CONSTRUCTION_SITES);

    if (hostileConstructionSites.length === 0) {
        return ERR_NOT_FOUND;
    }

    const A_GOES_FIRST = -1;
    const B_GOES_FIRST = 1;
    const A_B_SAME = 0;

    if (this.room.controller && this.room.controller.safeMode) {
        hostileConstructionSites.sort((a, b) => {
            if (a.structureType === b.structureType) {
                return A_B_SAME;
            }

            if (a.structureType === STRUCTURE_SPAWN) {
                return A_GOES_FIRST;
            }

            if (b.structureType === STRUCTURE_SPAWN) {
                return B_GOES_FIRST;
            }

            if (a.structureType === STRUCTURE_TOWER) {
                return A_GOES_FIRST;
            }

            if (b.structureType === STRUCTURE_TOWER) {
                return B_GOES_FIRST;
            }

            if (a.progress > b.progress) {
                return A_GOES_FIRST;
            }

            if (b.progress > a.progress) {
                return B_GOES_FIRST;
            }

            return A_B_SAME;
        });
        return hostileConstructionSites[0];
    } else {
        return utility.getClosestObjectFromArray(this, hostileConstructionSites);
    }
};