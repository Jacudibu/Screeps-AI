Spawn.prototype.drawSpawnInfo = function() {
    this.room.visual.text('>' + this.spawning.name, this.pos.x + 1, this.pos.y, {align: 'left', opacity: '0.5'});
};

Spawn.prototype.spawnWorker = function(role, energy, targetRoomName) {
    let body = [];

    if (energy > 200 * 16) {
        energy = 200 * 16;
    }

    while (energy >= 200) {
        body.push(WORK, CARRY, MOVE);
        energy -= 200;
    }

    body.sort();

    let opts = {
        memory: {
            role: role,
            targetRoomName: targetRoomName,
            task: targetRoomName ? TASK.MOVE_TO_ROOM : undefined,
            spawnRoom: this.room.name,
        }
    };

    return this._spawnDefinedCreep(role, body, opts);
};

Spawn.prototype.spawnDismantler = function(energy, targetRoomName) {
    let body = [];

    if (energy > 200 * 16) {
        energy = 200 * 16;
    }

    while (energy >= 200) {
        body.push(WORK, MOVE, CARRY);
        energy -= 200;
    }

    body.sort();
    let opts = {
        memory: {
            role: ROLE.DISMANTLER,
            targetRoomName: targetRoomName,
        }
    };

    return this._spawnDefinedCreep(ROLE.DISMANTLER, body, opts);
};

Spawn.prototype.spawnHauler = function(energy) {
    let body = [];

    if (energy > 1200) {
        energy = 1200;
    }

    while(energy >= 150) {
        body.push(CARRY, CARRY, MOVE);
        energy -= 150;
    }

    let opts = {
        memory: {
            role: ROLE.HAULER,
            respawnTTL: body.length * 3,
            spawnRoom: this.room.name,
        }
    };

    return this._spawnDefinedCreep(ROLE.HAULER, body, opts);
};

Spawn.prototype.spawnHarvester = function(energy) {
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
    let opts = {
        memory: {
            role: ROLE.HARVESTER,
            respawnTTL: body.length * 3,
            spawnRoom: this.room.name,
        }
    };

    return this._spawnDefinedCreep(ROLE.HARVESTER, body, opts);
};

Spawn.prototype.spawnMineralHarvester = function(energy) {
    let body = [];

    if (energy >= 250 * 16) {
        energy = 250 * 16;
    }

    while (energy >= 250) {
        body.push(WORK, WORK, MOVE);
        energy -= 250;
    }

    body.sort();
    let opts = {
        memory: {
            role: ROLE.MINERAL_HARVESTER,
            task: TASK.HARVEST_MINERAL,
            spawnRoom: this.room.name,
        }
    };

    return this._spawnDefinedCreep(ROLE.MINERAL_HARVESTER, body, opts);
};

Spawn.prototype.spawnUpgrader = function(energy) {
    let body = [];

    body.push(MOVE, CARRY);
    energy -= 100;

    for (let i = 0; i < 15 && energy > 150; i++) {
        body.push(WORK);

        if (i % 3 === 0) {
            body.push(CARRY);
        } else {
            body.push(MOVE);
        }

        energy -= 150;
    }

    body.sort();

    let opts = {
        memory: {
            role: ROLE.UPGRADER,
            spawnRoom: this.room.name,
        }
    };

    return this._spawnDefinedCreep(ROLE.UPGRADER, body, opts);
};

Spawn.prototype.spawnRemoteWorker = function(energy, targetRoomName, respawnTTL) {
    if (targetRoomName === undefined) {
        console.log("remoteRoomWorker needs a targetRoomName");
        return;
    }

    let body = [];

    if (energy > 250 * 10) {
        energy = 250 * 10;
    }

    while (energy >= 250) {
        body.push(WORK, MOVE, CARRY, MOVE);
        energy -= 250;
    }

    body.sort();
    let opts = {
        memory: {
            role: ROLE.REMOTE_WORKER,
            targetRoomName: targetRoomName,
            task: TASK.MOVE_TO_ROOM,
            respawnTTL: respawnTTL,
            spawnRoom: this.room.name,
        }
    };

    return this._spawnDefinedCreep(ROLE.REMOTE_WORKER, body, opts);
};

Spawn.prototype.spawnRemoteHauler = function(energy, targetRoomName) {
    if (!targetRoomName) {
        console.log("Unable to Spawn remote hauler, no target room name provided.");
        return;
    }

    let body = [];

    if (energy > 150 * 15) {
        energy = 150 * 15;
    }

    while(energy >= 150) {
        body.push(CARRY, CARRY, MOVE);
        energy -= 150;
    }

    let opts = {
        memory: {
            role: ROLE.REMOTE_HAULER,
            remoteHaulTargetRoom: targetRoomName,
            remoteHaulStorageRoom: this.room.name,
            targetRoomName: targetRoomName,
            task: TASK.MOVE_TO_ROOM,
            respawnTTL: 150,
            spawnRoom: this.room.name,
        }
    };

    return this._spawnDefinedCreep(ROLE.REMOTE_HAULER, body, opts);
};

Spawn.prototype.spawnRemoteHarvester = function(energy, targetRoomName) {
    if (targetRoomName === undefined) {
        console.log("remoteHarvester needs a targetRoomName");
        return;
    }

    let body = [];

    if (energy > 800) {
        energy = 800;
    }

    body.push(CARRY);
    energy -= 50;

    while (energy >= 250) {
        body.push(WORK, WORK, MOVE);
        energy -= 250;
    }

    body.sort();
    let opts = {
        memory: {
            role: ROLE.REMOTE_HARVESTER,
            targetRoomName: targetRoomName,
            task: TASK.MOVE_TO_ROOM,
            respawnTTL: 100,
            spawnRoom: this.room.name,
        }
    };

    return this._spawnDefinedCreep(ROLE.REMOTE_HARVESTER, body, opts);
};

Spawn.prototype.spawnRemoteRepairer = function(energy, targetRoomName, route) {
    if (!route) {
        console.log("Room route not provided. Using default queue for room.");
        if (!this.room.memory.repairRoute) {
            console.log("Unable to find default repair route for room. Cancelling spawn request...");
            return;
        }

        route = this.room.memory.repairRoute;
    }

    if (!targetRoomName) {
        targetRoomName = route[0];
    }

    let body = [];

    if (energy > 1750) {
        energy = 1750;
    }

    while(energy >= 350) {
        body.push(WORK, CARRY, CARRY, MOVE, MOVE, MOVE);
        energy -= 350;
    }

    body.sort();
    let opts = {
        memory: {
            role: ROLE.REMOTE_REPAIRER,
            targetRoomName: targetRoomName,
            route: route,
            task: TASK.COLLECT_ENERGY,
            respawnTTL: 50,
            spawnRoom: this.room.name,
        }
    };

    return this._spawnDefinedCreep(ROLE.REMOTE_REPAIRER, body, opts);
};

Spawn.prototype.spawnRemoteUpgrader = function(energy, targetRoomName, respawnTTL) {
    if (!targetRoomName) {
        console.log("spawnRemoteUpgrader: no TargetRoomName provided");
        return;
    }

    let body = [];

    if (energy > 200 * 16) {
        energy = 200 * 16;
    }

    while (energy >= 200) {
        body.push(WORK, MOVE, CARRY);
        energy -= 200;
    }
    body.sort();

    let opts = {
        memory: {
            role: ROLE.REMOTE_UPGRADER,
            targetRoomName: targetRoomName,
            respawnTTL: respawnTTL,
            spawnRoom: this.room.name,
            task: TASK.MOVE_TO_ROOM,
        }
    };

    return this._spawnDefinedCreep(ROLE.REMOTE_UPGRADER, body, opts);
};

Spawn.prototype.spawnClaimer = function(energy, targetRoomName) {
    if (!targetRoomName) {
        console.log("Unable to Spawn claimer, no target room name provided.");
        return;
    }

    let body = [];

    body.push(CLAIM, MOVE);
    body.sort();

    let opts = {
        memory: {
            role: ROLE.CLAIMER,
            targetRoomName: targetRoomName,
            task: TASK.MOVE_TO_ROOM,
        }
    };

    return this._spawnDefinedCreep(ROLE.CLAIMER, body, opts);
};

Spawn.prototype.spawnClaimerAttacker = function(energy, targetRoomName) {
    if (!targetRoomName) {
        console.log("Unable to Spawn claimerattacker, no target room name provided.");
        return;
    }

    let body = [];

    while(energy > 650) {
        body.push(CLAIM, MOVE);
        body.sort();
        energy -= 650;
    }

    let opts = {
        memory: {
            role: ROLE.CLAIMER_ATTACKER,
            targetRoomName: targetRoomName,
            task: TASK.MOVE_TO_ROOM,
        }
    };

    return this._spawnDefinedCreep(ROLE.CLAIMER_ATTACKER, body, opts);
};

Spawn.prototype.spawnReserver = function(energy, targetRoomName) {
    if (!targetRoomName) {
        console.log("Unable to Spawn reserver, no target room name provided.");
        return ERR_INVALID_TARGET;
    }

    let body = [];

    if (energy > 650 * 4) {
        energy = 650 * 4;
    }

    while(energy >= 650) {
        body.push(MOVE, CLAIM);
        energy -= 650;
    }

    let opts = {
        memory: {
            role: ROLE.RESERVER,
            targetRoomName: targetRoomName,
            task: TASK.MOVE_TO_ROOM,
            spawnRoom: this.room.name,
        }
    };

    return this._spawnDefinedCreep(ROLE.RESERVER, body, opts);
};

Spawn.prototype.spawnAttacker = function(energy, targetRoomName) {
    let body = [];

    while (energy >= 130) {
        body.push(ATTACK, MOVE);
        energy -= 130;
    }

    let opts = {
        memory: {
            role: ROLE.ATTACKER,
            targetRoomName: targetRoomName ? targetRoomName : this.room.name,
            task: TASK.MOVE_TO_ROOM,
        }
    };

    return this._spawnDefinedCreep(ROLE.ATTACKER, body, opts);
};

Spawn.prototype.spawnDefender = function(energy, targetRoomName) {
    let body = [];

    let maxLength = targetRoomName === this.room.name ? 50 : 30;

    while (energy >= 130 && body.length < maxLength) {
        body.push(ATTACK, MOVE);
        energy -= 130;
    }

    let opts = {
        memory: {
            role: ROLE.DEFENDER,
            targetRoomName: targetRoomName ? targetRoomName : this.room.name,
            homeRoomName: this.room.name,
            task: TASK.MOVE_TO_ROOM,
        }
    };

    return this._spawnDefinedCreep(ROLE.DEFENDER, body, opts);
};

Spawn.prototype.spawnAnnoyer = function(energy, targetRoomName) {
    let body = [];

    if (energy < 130) {
        return;
    }

    body.push(ATTACK, MOVE);
    energy -= 130;

    while (energy >= 60) {
        body.push(TOUGH, MOVE);
        energy -= 60;
    }

    body.sort().reverse();
    let opts = {
        memory: {
            role: ROLE.ATTACKER,
            targetRoomName: targetRoomName ? targetRoomName : this.room.name,
            task: TASK.MOVE_TO_ROOM,
        }
    };

    return this._spawnDefinedCreep(ROLE.ATTACKER, body, opts);
};

Spawn.prototype.spawnCarrier = function(energy, targetRoomName, storageRoomName, respawnTTL) {
    if (!targetRoomName) {
        console.log("Unable to Spawn carrier, no target room name provided.");
        return;
    }

    let body = [];

    if (energy > 100 * 25) {
        energy = 100 * 25;
    }

    while(energy >= 100) {
        body.push(CARRY, MOVE);
        energy -= 100;
    }

    let opts = {
        memory: {
            role: ROLE.CARRIER,
            remoteHaulTargetRoom: targetRoomName,
            remoteHaulStorageRoom: storageRoomName ? storageRoomName : this.room.name,
            targetRoomName: storageRoomName ? storageRoomName : this.room.name,
            task: storageRoomName ? TASK.MOVE_TO_ROOM : TASK.COLLECT_ENERGY,
            respawnTTL: respawnTTL,
            spawnRoom: this.room.name,
        }
    };

    return this._spawnDefinedCreep(ROLE.CARRIER, body, opts);
};

Spawn.prototype.spawnCitizen = function(energy, role, opts) {

};

Spawn.prototype._spawnDefinedCreep = function(role, body, opts) {
    let name = role + Memory.creepsBuilt;

    let result = this.spawnCreep(body, name, opts);

    switch (result) {
        case OK:
            Memory.creepsBuilt = Memory.creepsBuilt + 1;
            break;
        case ERR_NOT_ENOUGH_ENERGY:
            break;
        default:
            console.log("unexpected error when spawning creep: " + this.spawnCreep(body, name, opts)
                + "\nBody: " + body + " name:" + name + "memory:" + opts);
            break;
    }

    return result;
};