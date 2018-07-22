Room.prototype.initSpawnMemory = function() {
    this.memory.requestedCreeps = {};
    this.memory.requestedCreeps[ROLE.HARVESTER] = 9;
    this.memory.requestedCreeps[ROLE.UPGRADER] = 1;
    this.memory.requestedCreeps[ROLE.BUILDER] = 1;
    this.memory.requestedCreeps[ROLE.REPAIRER] = 1;
};

Room.prototype.setRequestedCreepRole = function(role, count) {
    this.memory.requestedCreeps[role] = count;
};

Room.prototype.addRemoteMiningRoom = function (roomName) {
    if (!this.memory.remoteMiningRooms) {
        this.memory.remoteMiningRooms = [];
    }

    this.memory.remoteMiningRooms.push(roomName);
};

Room.prototype.removeRemoteMiningRoom = function(roomName) {
    if (!this.memory.remoteMiningRooms) {
        return;
    }

    let index = this.memory.remoteMiningRooms.indexOf(roomName);
    if (index > -1) {
        this.memory.remoteMiningRooms.splice(index, 1);
    }
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