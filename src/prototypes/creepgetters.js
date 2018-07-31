// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~ private getters used by creeptasks ~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Creep.prototype._getSource = function() {
    if (this.memory.taskTargetId) {
        return Game.getObjectById(this.memory.taskTargetId);
    }

    let source = this.room.getUnoccupiedSource();
    if (source === ERR_NOT_FOUND)  {
        return ERR_NOT_FOUND;
    }

    source.memory.workersAssigned++;
    this.memory.taskTargetId = source.id;
    return source;
};

Creep.prototype._getStorage = function() {
    // TODO: right now we are waaay below cpu limit, so don't care
    // if (this.memory.taskTargetId) {
    //     return Game.getObjectById(this.memory.taskTargetId);
    // }

    const structureThatRequiresEnergy = this.findClosestFreeEnergyStorage();

    if (structureThatRequiresEnergy === ERR_NOT_FOUND) {
        return ERR_NOT_FOUND;
    }

    this.memory.taskTargetId = structureThatRequiresEnergy.id;
    return structureThatRequiresEnergy;
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

    let spawns = this.room.find(FIND_MY_SPAWNS);
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
                return constructionA.pos.getRangeTo(spawns[0] - constructionB.pos.getRangeTo(spawns[0]));
            } else {
                return compareProgress;
            }
        });
    } else {
        // No spawn, just get the closest structure to our creep
        constructionSites = _.sortBy(constructionSites, site => site.pos.getRangeTo(this))
    }

    this.memory.taskTargetId = constructionSites[0].id;
    return constructionSites[0];
};

Creep.prototype._getDamagedStructure = function() {
    if (this.memory.taskTargetId) {
        let previousTarget = Game.getObjectById(this.memory.taskTargetId);

        // might have been destroyed by enemies or bulldozing players, so check its existence.
        if (previousTarget !== null) {
            if (previousTarget.hits < previousTarget.hitsMax) {
                return previousTarget;
            }
        }
    }

    const damagedStructures = this.room.find(FIND_STRUCTURES, {
        filter: structure => {

            if (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART) {
                return structure.hits < WALLS_REPAIR_MAX[this.room.controller.level];
            }

            if (structure.structureType === STRUCTURE_SPAWN) {
                return structure.hits < structure.hitsMax;
            }

            return structure.hits < structure.hitsMax * 0.75
        }
    });

    damagedStructures.sort((a,b) => {
        let diff = a.hits - b.hits;
        if (diff === 0) {
            return this.pos.getRangeTo(a) - this.pos.getRangeTo(b);
        }

        return a.hits - b.hits
    });

    if(damagedStructures.length === 0) {
        return ERR_NOT_FOUND;
    }

    this.memory.taskTargetId = damagedStructures[0].id;
    return damagedStructures[0];
};

Creep.prototype._getHaulTarget = function() {
    if (this.memory.taskTargetId) {
        return Game.getObjectById(this.memory.taskTargetId);
    }

    let potentialTarget = this.findHighestDroppedEnergyAboveHaulThreshold();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.memory.taskTargetId = potentialTarget.id;
        return potentialTarget;
    }

    potentialTarget = this.findClosestContainerAboveHaulThreshold();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.memory.taskTargetId = potentialTarget.id;
        return potentialTarget;
    }

    potentialTarget = this.findClosestDroppedEnergy();
    if (potentialTarget !== ERR_NOT_FOUND) {
        this.memory.taskTargetId = potentialTarget.id;
        return potentialTarget;
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