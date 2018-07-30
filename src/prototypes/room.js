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

    if (Memory.rooms[roomName].assignedRemoteWorkers === undefined) {
        Memory.rooms[roomName].assignedRemoteWorkers = 0;
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
        Memory.rooms[roomName].assignedRemoteWorkers = undefined;
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

    let index = this.memory.publicEnergyContainers.indexOf(containerId);
    if (index > -1) {
        this.memory.publicEnergyContainers.splice(index, 1);
    }
};

Room.prototype.setAutoSpawn = function(shouldSpawn) {
    this.memory.autoSpawnEnabled = shouldSpawn;
};

Room.prototype.getPublicEnergyContainers = function() {
    return this.memory.publicEnergyContainers;
};

Room.prototype.isSpawnQueueEmpty = function() {
    return this.memory.spawnQueue === undefined || this.memory.spawnQueue.length === 0;
};

Room.prototype.addToSpawnQueue = function(args) {
    if (this.memory.spawnQueue === undefined) {
        this.memory.spawnQueue = [];
    }

    this.memory.spawnQueue.push(args);
};

Room.prototype._findTowers = function() {
    return _.filter(this.find(FIND_MY_STRUCTURES), function (structure) {
        return structure.structureType === STRUCTURE_TOWER;
    });
};

Room.prototype.commandTowersToAttackTarget = function(target) {
    const towers = this._findTowers();

    if (towers.length === 0) {
        return;
    }

    for (let i = 0; i < towers.length; i++) {
        towers[i].attack(target);
    }
};

Room.prototype.commandTowersToHealCreep = function(target) {
    const towers = this._findTowers();

    for (let i = 0; i < towers.length; i++) {
        towers[i].heal(target);
    }
};

Room.prototype.findDamagedCreeps = function() {
    return _.filter(this.find(FIND_MY_CREEPS), function (creep) {
        return creep.hits < creep.hitsMax;
    });
};

Room.prototype.initializeMemoryForAllSourcesInRoom = function() {
    this.memory.sources = {};
    const sources = this.find(FIND_SOURCES);
    for (let i = 0; i < sources.length; i++) {
        sources[i].initializeMemory();
    }
};

Room.prototype.getUnoccupiedSource = function() {
    if (!this.memory.sources) {
        this.initializeMemoryForAllSourcesInRoom();
    }

    let keys = Object.keys(this.memory.sources);
    for (let i = 0; i < keys.length; i++) {
        if (this.memory.sources[keys[i]].workersAssigned < this.memory.sources[keys[i]].workersMax) {
            return Game.getObjectById(keys[i]);
        }
    }

    return ERR_NOT_FOUND;
};

