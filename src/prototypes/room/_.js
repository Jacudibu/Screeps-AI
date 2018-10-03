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

    log.warning("You asked for it! " + this + " just got completely wiped.");

    this.wipeConstructionSites();

    let structures = this.find(FIND_STRUCTURES);

    for (let i = 0; i < structures.length; i++) {
        structures[i].destroy();
    }

    let creeps = this.find(FIND_MY_CREEPS);
    for (let i = 0; i < creeps.length; i++) {
        creeps[i].suicide();
    }

    delete this.memory;

};

Room.prototype.updateRepairRoute = function() {
    this.memory.repairRoute = this.remotes;
};

Room.prototype.addPublicEnergyContainer = function (containerId) {
    if (!this.memory.publicEnergyContainers) {
        this.memory.publicEnergyContainers = [];
    }

    if (containerId != null) {
        this.memory.publicEnergyContainers.push(containerId);
    }
};

Room.prototype.removePublicEnergyContainer = function(containerId) {
    if (!this.memory.publicEnergyContainers) {
        return;
    }

    _.remove(this.memory.publicEnergyContainers, id => id ===containerId);
};

Room.prototype.isSpawnQueueEmpty = function() {
    return this.memory.spawnQueue === undefined || this.memory.spawnQueue.length === 0;
};

Room.prototype.addToSpawnQueueEnd = function(args) {
    if (this.memory.spawnQueue === undefined) {
        this.memory.spawnQueue = [];
    }

    this.memory.spawnQueue.push(args);
};

Room.prototype.addToSpawnQueueStart = function(args) {
    if (this.memory.spawnQueue === undefined) {
        this.memory.spawnQueue = [];
    }

    this.memory.spawnQueue.unshift(args);
};

Room.prototype._findTowers = function() {
    return _.filter(this.find(FIND_MY_STRUCTURES), function (structure) {
        return structure.structureType === STRUCTURE_TOWER;
    });
};

Room.prototype.commandTowersToAttackTarget = function(target) {
    const towers = this.myTowers;

    if (towers.length === 0) {
        return;
    }

    for (let i = 0; i < towers.length; i++) {
        towers[i].attack(target);
    }
};

Room.prototype.commandTowersToHealCreep = function(target) {
    const towers = this.myTowers;

    for (let i = 0; i < towers.length; i++) {
        towers[i].heal(target);
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
    return _.filter(this.find(FIND_MY_CREEPS), function (creep) {
        return creep.hits < creep.hitsMax;
    });
};

Room.prototype.initializeMemoryForAllSourcesInRoom = function() {
    this.memory.sources = {};
    const sources = this.sources;
    for (let i = 0; i < sources.length; i++) {
        sources[i].initializeMemory();
    }
};

Room.prototype.getUnoccupiedSources = function() {
    if (!this.memory.sources) {
        this.initializeMemoryForAllSourcesInRoom();
    }

    let sources = [];

    let keys = Object.keys(this.memory.sources);
    for (let i = 0; i < keys.length; i++) {
        if (this.memory.sources[keys[i]].workersAssigned < this.memory.sources[keys[i]].workersMax) {
            let source = Game.getObjectById(keys[i]);
            if (source.energy > 0) {
                sources.push(Game.getObjectById(keys[i]));
            }
        }
    }

    if (sources.length === 0) {
        return ERR_NOT_FOUND;
    } else {
        return sources;
    }

};

Room.prototype.getEmptyPublicEnergyContainers = function() {
    if (!this._emptyPublicEnergyContainers) {
        const publicEnergyContainerMemoryEntry = this.memory.publicEnergyContainers;
        if (!publicEnergyContainerMemoryEntry) {
            return ERR_NOT_FOUND;
        }

        this._emptyPublicEnergyContainers = this.memory.publicEnergyContainers
            .map(id => Game.getObjectById(id))
            .filter(container => container && (_.sum(container.store) < container.storeCapacity));
    }

    if (this._emptyPublicEnergyContainers.length === 0) {
        return ERR_NOT_FOUND;
    }

    return this._emptyPublicEnergyContainers;
};