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