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

    Memory.rooms[roomName].assignedRemoteWorkers = 0;
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

Room.prototype.getRoomPositionForTransferToRoom = function(roomName) {
    if (roomName === 'E57S47') {
        return new RoomPosition(47, 23, roomName);
    }

    if (roomName === 'E58S47') {
        return new RoomPosition(25, 25, roomName);
    }

    if (roomName === 'E59S47') {
        return new RoomPosition(3, 44, roomName);
    }

    if (roomName === 'E58S48') {
        return new RoomPosition(28, 18, roomName);
    }

    if (roomName === 'E59S48') {
        return new RoomPosition(24, 17, roomName);
    }

    return new RoomPosition(25, 25, roomName);
};

Room.prototype.getPublicEnergyContainers = function() {
    return this.memory.publicEnergyContainers;
};

Room.prototype.isSpawnQueueEmpty = function() {
    return this.memory.spawnQueue === undefined || this.memory.spawnQueue.length === 0;
};

Room.prototype.addToSpawnQueue = function(role) {
    if (this.memory.spawnQueue === undefined) {
        this.memory.spawnQueue = [];
    }

    this.memory.spawnQueue.push(role);
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