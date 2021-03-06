Object.defineProperty(Room.prototype, "claimedByMe", {
    enumerable: false,
    configurable: true,
    get: function() {return this.controller && this.controller.my; }
});

Room.prototype.wipeConstructionSites = function() {
    let sites = this.find(FIND_MY_CONSTRUCTION_SITES);

    for (let i = 0; i < sites.length; i++) {
        if (sites[i].progress === 0) {
            sites[i].remove();
        }
    }
};

Room.prototype.wipeEverything = function(areYouSure1, areYouSure2, areYouSure3) {
    if (!areYouSure1 || !areYouSure2 || !areYouSure3) {
        log.warning("Please call this with (true, true, true), just to make sure...");
        return;
    }

    delete this.memory;

    this.wipeConstructionSites();

    let structures = this.find(FIND_STRUCTURES);

    for (let i = 0; i < structures.length; i++) {
        structures[i].destroy();
    }

    let creeps = this.find(FIND_MY_CREEPS);
    for (let i = 0; i < creeps.length; i++) {
        creeps[i].suicide();
    }

    log.warning("You asked for it! " + this + " just got completely wiped.");
};

Room.prototype.updateRepairRoute = function() {
    this.memory.repairRoute = this.remotes;
};

Room.prototype.commandTowersToHealCreep = function(target) {
    const towers = this.myTowers;

    let creepHits = target.hits;
    for (let i = 0; i < towers.length && creepHits < target.hitsMax; i++) {
        towers[i].heal(target);
        creepHits += TOWER_POWER_HEAL;
    }

    target.say(creepTalk.gettingHealed, true);
};

Room.prototype.commandTowersToRepairStructure = function(target) {
    const towers = this.myTowers;

    for (let i = 0; i < towers.length; i++) {
        towers[i].repair(target);
    }
};

Room.prototype.findDamagedCreeps = function() {
    return this.find(FIND_MY_CREEPS, {filter: creep => creep.hits < creep.hitsMax});
};

Room.prototype.findDamagedStructures = function(percentageToCountAsDamaged = 0.75) {
    return this.find(FIND_STRUCTURES, {
        filter: structure => {
            if (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART) {
                if (percentageToCountAsDamaged > 0.5) {
                    return structure.hits < WALLS_REPAIR_MAX[this.controller.level];
                } else {
                    return structure.hits < WALLS_REPAIR_MAX[this.controller.level] * percentageToCountAsDamaged;
                }
            }

            if (structure.structureType === STRUCTURE_SPAWN) {
                return structure.hits < structure.hitsMax;
            }

            return structure.hits < structure.hitsMax * percentageToCountAsDamaged;
        }
    });
};

Room.prototype.getUnoccupiedSources = function() {
    let possibleSources = [];

    for (let source of this.sources) {
        if (source.assignedWorkers < MAX_WORKERS_PER_SOURCE && source.energy > 0) {
            possibleSources.push(source);
        }
    }

    if (possibleSources.length === 0) {
        return ERR_NOT_FOUND;
    } else {
        return possibleSources;
    }
};

Room.prototype.getEmptyPublicEnergyContainers = function() {
    if (this.containers.length === 0) {
        return ERR_NOT_FOUND;
    }

    this._emptyPublicEnergyContainers = this.containers
        .filter(container => container
                          && !container.isNextToSourceOrMineral
                          && _.sum(container.store) < container.storeCapacity);

    if (this._emptyPublicEnergyContainers.length === 0) {
        return ERR_NOT_FOUND;
    }

    return this._emptyPublicEnergyContainers;
};