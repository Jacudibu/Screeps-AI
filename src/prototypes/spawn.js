Spawn.prototype.drawSpawnInfo = function() {
    this.room.visual.text('🛠️' + this.spawning.name, this.pos.x + 1, this.pos.y, {align: 'left', opacity: '0.5'});
};

Spawn.prototype.spawnWorker = function(role, energy, blockSpawningIfNoResources) {
    let body = [];

    if (energy > 200 * 16) {
        energy = 200 * 16;
    }

    while (energy >= 200) {
        body.push(WORK, CARRY, MOVE);
        energy -= 200;
    }

    body.sort();

    this._spawnDefinedCreep(role, blockSpawningIfNoResources, body, {memory: {role: role}});
};

Spawn.prototype.spawnHauler = function(energy, blockSpawningIfNoResources) {
    let body = [];

    if (energy > 5000) {
        energy = 5000;
    }

    while(energy >= 150) {
        body.push(CARRY, CARRY, MOVE);
        energy -= 150;
    }

    body.sort();

    this._spawnDefinedCreep(ROLE.HAULER, blockSpawningIfNoResources, body, {memory: {role: ROLE.HAULER}});
};

Spawn.prototype.spawnHarvester = function(energy, blockSpawningIfNoResources) {
    let body = [];

    let remainder = 0;
    if (energy >= 550) {
        remainder = energy - 550;
        energy = 550;
    }

    body.push(MOVE);
    energy -= 50;

    while (energy >= 100) {
        body.push(WORK);
        energy -= BODYPART_COST.work;
    }

    if (remainder >= 100) {
        body.push(MOVE);
        body.push(MOVE);
    }

    body.sort();

    this._spawnDefinedCreep(ROLE.HARVESTER, blockSpawningIfNoResources, body, {memory: {role: ROLE.HARVESTER}});
};

Spawn.prototype.spawnUpgrader = function(energy, blockSpawningIfNoResources) {
    let body = [];

    if (energy > 300 * 16) {
        energy = 300 * 16;
    }

    while (energy >= 300) {
        body.push(WORK, WORK, CARRY, MOVE);
        energy -= 300;
    }

    body.sort();

    this._spawnDefinedCreep(ROLE.UPGRADER, blockSpawningIfNoResources, body, {memory: {role: ROLE.UPGRADER}});
};

Spawn.prototype.spawnRemoteWorker = function(energy, blockSpawningIfNoResources, targetRoomName) {
    if (targetRoomName === undefined) {
        console.log("remoteRoomWorkers needs a targetRoomName");
        return;
    }

    let body = [];

    if (energy > 600) {
        energy = 600;
    }

    while (energy >= 200) {
        body.push(WORK, CARRY, MOVE);
        energy -= 200;
    }

    body.sort();
    let opts = {
        memory: {
            role: ROLE.REMOTE_WORKER,
            targetRoomName: targetRoomName
        }
    };

    this._spawnDefinedCreep(ROLE.REMOTE_WORKER, blockSpawningIfNoResources, body, opts);
};

Spawn.prototype.spawnAttacker = function(energy) {
    let body = [];

    while (energy >= 130) {
        body.push(ATTACK, MOVE);
        energy -= 130;
    }

    body.sort();

    this._spawnDefinedCreep(ROLE.ATTACKER, false, body, {memory: {role: ROLE.ATTACKER}});
};

Spawn.prototype._spawnDefinedCreep = function(role, blockSpawningIfNoResources, body, memory) {
    let name = role + '#' + Memory.creepsBuilt;

    switch (this.spawnCreep(body, name, memory)) {
        case OK:
            this.room.memory.allowEnergyCollection = true;
            Memory.creepsBuilt = Memory.creepsBuilt + 1;
            break;
        case ERR_NOT_ENOUGH_ENERGY:
            if (blockSpawningIfNoResources) {
                this.room.memory.allowEnergyCollection = false;
            }
            break;
        default:
            console.log("unexpected error when spawning creep: " + this.spawnCreep(body, name, memory)
                + "\nBody: " + body + " name:" + name + "memory:" + memory);
            this.room.memory.allowEnergyCollection = true;
            break;
    }
};
