Room.prototype.initSpawnMemory = function() {
    this.memory.requestedCreeps = {};
    this.memory.requestedCreeps[ROLE.HARVESTER] = 0;
    this.memory.requestedCreeps[ROLE.HAULER] = 0;
    this.memory.requestedCreeps[ROLE.UPGRADER] = 1;
    this.memory.requestedCreeps[ROLE.BUILDER] = 0;
    this.memory.requestedCreeps[ROLE.REPAIRER] = 0;
};

Room.prototype.setRequestedCreepRole = function(role, count) {
    this.memory.requestedCreeps[role] = count;
};

Room.prototype.wipeConstructionSites = function() {
    let sites = this.find(FIND_MY_CONSTRUCTION_SITES);

    for (let i = 0; i < sites.length; i++) {
        sites[i].remove();
    }
};

Room.prototype.addRemoteMiningRoom = function (roomName) {
    if (!this.memory.remoteMiningRooms) {
        this.memory.remoteMiningRooms = [];
    }

    this.memory.remoteMiningRooms.push(roomName);

    if (Memory.rooms[roomName] === undefined) {
        Memory.rooms[roomName] = {};
    }

    if (Memory.rooms[roomName].assignedHarvesters === undefined) {
        Memory.rooms[roomName].assignedHarvesters = 0;
        Memory.rooms[roomName].assignedHaulers = 0;
        Memory.rooms[roomName].requiredHaulers = 0;
    }
};

Room.prototype.removeRemoteMiningRoom = function(roomName) {
    if (!this.memory.remoteMiningRooms) {
        return;
    }

    let index = this.memory.remoteMiningRooms.indexOf(roomName);
    if (index > -1) {
        Memory.rooms[roomName].assignedHarvesters = undefined;
        this.memory.remoteMiningRooms.splice(index, 1);
    }
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

Room.prototype.setAutoSpawn = function(shouldSpawn) {
    this.memory.autoSpawnEnabled = shouldSpawn;
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

    target.say("=^~^=", true);
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
            sources.push(Game.getObjectById(keys[i]));
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