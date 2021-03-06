Spawn.prototype.drawSpawnInfo = function() {
    this.drawDebugText(this.spawning.name + " | " + (this.spawning.remainingTime - 1));
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

Spawn.prototype.spawnRepairer = function(energy) {
    return this.spawnWorker(ROLE.REPAIRER, energy);
};

Spawn.prototype.spawnBuilder = function(energy) {
    return this.spawnWorker(ROLE.BUILDER, energy);
};

Spawn.prototype.spawnEarlyRCLHarvester = function(energy) {
    let body = [];

    if (energy > 250 * 12) {
        energy = 250 * 12;
    }

    while (energy >= 250) {
        body.push(CARRY, MOVE, WORK, MOVE);
        energy -= 250;
    }

    if (energy >= 150) {
        body.push(WORK, MOVE);
    }

    body.sort();

    let opts = {
        memory: {
            role: ROLE.EARLY_RCL_HARVESTER,
            task: TASK.HARVEST_ENERGY,
            spawnRoom: this.room.name,
        }
    };

    return this._spawnDefinedCreep(ROLE.EARLY_RCL_HARVESTER, body, opts);
};

Spawn.prototype.spawnDismantler = function(energy, targetRoomName, respawnTTL, taskTargetId) {
    let body = [];

    if (energy > 150 * 25) {
        energy = 150 * 25;
    }

    while (energy >= 150) {
        body.push(WORK, MOVE);
        energy -= 150;
    }

    body.sort();
    body.reverse();

    let opts = {
        memory: {
            role: ROLE.DISMANTLER,
            respawnTTL: respawnTTL,
            targetRoomName: targetRoomName,
            taskTargetId: taskTargetId,
        }
    };

    return this._spawnDefinedCreep(ROLE.DISMANTLER, body, opts);
};

Spawn.prototype.spawnHauler = function(energy) {
    let body = [];

    if (energy > 150 * 10) {
        energy = 150 * 10;
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
        remainder -= 100;
    }

    if (remainder >= 50 && this.room.myLinks.length >= 2) {
        body.push(CARRY);
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
            task: TASK.MOVE_ONTO_CONTAINER,
            spawnRoom: this.room.name,
        }
    };

    return this._spawnDefinedCreep(ROLE.MINERAL_HARVESTER, body, opts);
};

Spawn.prototype.spawnUpgrader = function(energy) {
    let body = [];

    body.push(MOVE, MOVE, CARRY, CARRY);
    energy -= 200;

    const maxWorkParts = this.room.controller.level === 8 ? 15 : (46 - body.length);
    for (let i = 0; i < maxWorkParts && energy >= 100; i++) {
        body.push(WORK);
        energy -= 100;
    }

    let opts = {
        memory: {
            role: ROLE.UPGRADER,
            spawnRoom: this.room.name,
            task: TASK.SIGN_CONTROLLER,
        }
    };

    return this._spawnDefinedCreep(ROLE.UPGRADER, body, opts);
};

Spawn.prototype.spawnRemoteWorker = function(energy, targetRoomName, respawnTTL) {
    if (targetRoomName === undefined) {
        log.info("remoteRoomWorker needs a targetRoomName");
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
        log.info("Unable to Spawn remote hauler, no target room name provided.");
        return;
    }

    let body = [];

    if (energy > 150 * 16 + 100) { // 16*3 = 48 body parts
        energy = 150 * 16 + 100;
    }

    while(energy >= 150) {
        body.push(CARRY, CARRY, MOVE);
        energy -= 150;
    }

    if (energy >= 100) {
        body.push(CARRY, MOVE); // final 2 body parts
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
        log.info("remoteHarvester needs a targetRoomName");
        return;
    }

    let body = [];

    if (energy >= 800) {
        energy = 800;
    }

    body.push(MOVE);
    energy -= 50;

    for (let i = 0; i < 5 && energy >= 100; i++) {
        body.push(WORK);
        energy -= 100;
    }

    for (let i = 0; i < 2 && energy >= 50; i++) {
        body.push(MOVE);
        energy -= 50;
    }

    if (energy >= 150) {
        body.push(WORK, CARRY);
    }

    let opts = {
        memory: {
            role: ROLE.REMOTE_HARVESTER,
            targetRoomName: targetRoomName,
            task: TASK.MOVE_TO_ROOM,
            respawnTTL: RESPAWN_TTL_NOT_YET_SET,
            spawnRoom: this.room.name,
        }
    };

    return this._spawnDefinedCreep(ROLE.REMOTE_HARVESTER, body, opts);
};

Spawn.prototype.spawnRemoteRepairer = function(energy, repairRouteIndex = 0) {
    let body = [];

    if (energy > 350 * 8) {
        energy = 350 * 8;
    }

    while(energy >= 350) {
        body.push(WORK, CARRY, CARRY, MOVE, MOVE, MOVE);
        energy -= 350;
    }

    body.sort();
    let opts = {
        memory: {
            role: ROLE.REMOTE_REPAIRER,
            targetRoomName: this.room.memory.repairRoute[repairRouteIndex],
            repairRouteIndex: repairRouteIndex,
            task: TASK.COLLECT_ENERGY,
            spawnRoom: this.room.name,
        }
    };

    return this._spawnDefinedCreep(ROLE.REMOTE_REPAIRER, body, opts);
};

Spawn.prototype.spawnRemoteUpgrader = function(energy, targetRoomName, respawnTTL) {
    if (!targetRoomName) {
        log.info("spawnRemoteUpgrader: no TargetRoomName provided");
        return;
    }

    let body = [];

    if (energy > 350 * 10) {
        energy = 350 * 10;
    }

    while (energy >= 350) {
        body.push(WORK, WORK, MOVE, MOVE, CARRY);
        energy -= 350;
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
        log.info("Unable to Spawn claimer, no target room name provided.");
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
        log.info("Unable to Spawn claimerattacker, no target room name provided.");
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
            spawnRoom: this.room.name,
        }
    };

    return this._spawnDefinedCreep(ROLE.CLAIMER_ATTACKER, body, opts);
};

Spawn.prototype.spawnReserver = function(energy, targetRoomName) {
    if (!targetRoomName) {
        log.info("Unable to Spawn reserver, no target room name provided.");
        return ERR_INVALID_TARGET;
    }

    let body = [];

    if (energy > 650 * 8) {
        energy = 650 * 8;
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

    if (energy > 130 * 25) {
        energy = 130 * 25;
    }

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

Spawn.prototype.spawnDrainAttacker = function(energy, targetRoomName) {
    let body = [];

    for (let i = 0; i < 3; i++) {
        body.push(TOUGH);
        energy -= 10;
    }

    body.push(RANGED_ATTACK);
    energy -= 150;

    if (energy > 6000) {
        body.push(RANGED_ATTACK, RANGED_ATTACK);
        body.push(MOVE, MOVE);
        energy -= 400;
    }

    body.push(MOVE, MOVE, MOVE, MOVE);
    energy -= 200;

    // 8 parts gone, rest is fun

    let remainingPartCount = energy / 300;
    if (remainingPartCount > 19) {
        remainingPartCount = 19;
    }

    for (let i = 0; i < remainingPartCount; i++) {
        body.push(MOVE);
    }

    for (let i = 0; i < remainingPartCount; i++) {
        body.push(HEAL);
    }

    let opts = {
        memory: {
            role: ROLE.GUIDED_RANGED_ATTACKER,
            targetRoomName: targetRoomName ? targetRoomName : this.room.name,
            task: TASK.MOVE_TO_ROOM,
        }
    };

    return this._spawnDefinedCreep(ROLE.GUIDED_RANGED_ATTACKER, body, opts);
};

const RANGED_TO_HEAL_RATIO = 4;
Spawn.prototype.spawnRangedAttacker = function(energy, targetRoomName) {
    let body = [];

    // Heal to range ratio => 4:1
    let additionalHealCount = 1;
    energy -= 300;

    for (let i = 0; (i * 2 + additionalHealCount * 2) < 50 && energy >= 200; i++) {
        body.push(RANGED_ATTACK, MOVE);
        energy -= 200;

        if (i % RANGED_TO_HEAL_RATIO === 0 && energy >= 300) {
            additionalHealCount++;
            energy -= 300;
        }
    }

    body.sort();

    for (let i = 0; i < additionalHealCount; i++) {
        body.push(MOVE);
    }
    for (let i = 0; i < additionalHealCount; i++) {
        body.push(HEAL);
    }

    let opts = {
        memory: {
            role: ROLE.RANGED_ATTACKER,
            targetRoomName: targetRoomName ? targetRoomName : this.room.name,
            task: TASK.DISABLE_ATTACK_NOTIFICATION,
        }
    };

    return this._spawnDefinedCreep(ROLE.RANGED_ATTACKER, body, opts);
};

Spawn.prototype.spawnHealer = function(energy, targetRoomName) {
    let body = [];

    while (energy >= 300 && body.length < 50) {
        body.push(HEAL, MOVE);
        energy -= 300;
    }

    body.sort();
    body.reverse();

    let opts = {
        memory: {
            role: ROLE.HEALER,
            targetRoomName: targetRoomName ? targetRoomName : this.room.name,
            task: TASK.MOVE_TO_ROOM,
        }
    };

    return this._spawnDefinedCreep(ROLE.HEALER, body, opts);
};


Spawn.prototype.spawnGuidedRangedAttacker = function(energy, targetRoomName) {
    let body = [];

    if (energy < 2 * 10 + 25 * 50 + 5 * 150 + 18 * 250) {
        log.info("not enough energy. Need at least " + (2 * 10 + 25 * 50 + 5 * 150 + 18 * 250) + " for that monstrosity..");
        return;
    }

    for (let i = 0; i < 2; i++) {
        body.push(TOUGH);
    }

    for (let i = 0; i < 5; i++) {
        body.push(RANGED_ATTACK);
    }

    for (let i = 0; i < 24; i++) {
        body.push(MOVE);
    }

    for (let i = 0; i < 18; i++) {
        body.push(HEAL);
    }

    body.push(MOVE);

    let opts = {
        memory: {
            role: ROLE.GUIDED_RANGED_ATTACKER,
            targetRoomName: targetRoomName ? targetRoomName : this.room.name,
            task: TASK.MOVE_TO_ROOM,
        }
    };

    return this._spawnDefinedCreep(ROLE.GUIDED_RANGED_ATTACKER, body, opts);
};

Spawn.prototype.spawnDefender = function(energy, targetRoomName) {
    let body = [];

    let maxLength = targetRoomName === this.room.name ? 50 : 30;

    let isNPCAttack = false;
    let room = Game.rooms[targetRoomName];
    if (room) {
        if (roomThreats[room.name]) {
            if (roomThreats[room.name].onlyNPCs) {
                maxLength = Math.min(50, roomThreats[room.name].total * 2);
                isNPCAttack = true;
            } else {
                // Full power TODO: finetuning
                maxLength = 48;
            }
        } else {
            // no threat remaining, so no spawn needed
            return OK;
        }
    } else {
        // no vision? mmh... TODO?
        maxLength = 30;
    }

    while (energy >= 130 && body.length < maxLength) {
        body.push(ATTACK, MOVE);
        energy -= 130;
    }

    if (maxLength === 48 && !isNPCAttack) {
        if (energy >= BODYPART_COST.heal + BODYPART_COST.move) {
            body.push(MOVE, HEAL);
        }
    }

    let opts = {
        memory: {
            role: ROLE.DEFENDER,
            targetRoomName: targetRoomName ? targetRoomName : this.room.name,
            homeRoomName: this.room.name,
            task: TASK.DECIDE_WHAT_TO_DO,
            stayInRoom: isNPCAttack ? undefined : true,
        }
    };

    return this._spawnDefinedCreep(ROLE.DEFENDER, body, opts);
};

Spawn.prototype.spawnRangedDefender = function(energy, targetRoomName) {
    let body = [];

    let maxLength = targetRoomName === this.room.name ? 50 : 30;

    let isNPCAttack = false;
    let room = Game.rooms[targetRoomName];
    if (room) {
        if (roomThreats[room.name]) {
            if (roomThreats[room.name].onlyNPCs) {
                maxLength = Math.min(50, roomThreats[room.name].total * 2);
                isNPCAttack = true;
            } else {
                // Full power TODO: finetuning
                maxLength = 48;
            }
        } else {
            // no threat remaining, so no spawn needed
            return OK;
        }
    } else {
        // no vision? mmh... TODO?
        maxLength = 30;
    }

    while (energy >= 200 && body.length < maxLength) {
        body.push(RANGED_ATTACK, MOVE);
        energy -= 200;
    }

    if (maxLength === 48 && !isNPCAttack) {
        if (energy >= BODYPART_COST.heal + BODYPART_COST.move) {
            body.push(MOVE, HEAL);
        }
    }

    let opts = {
        memory: {
            role: ROLE.RANGED_DEFENDER,
            targetRoomName: targetRoomName ? targetRoomName : this.room.name,
            homeRoomName: this.room.name,
            task: TASK.DECIDE_WHAT_TO_DO,
            stayInRoom: isNPCAttack ? undefined : true,
        }
    };

    return this._spawnDefinedCreep(ROLE.RANGED_DEFENDER, body, opts);
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
        log.info("Unable to Spawn carrier, no target room name provided.");
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

Spawn.prototype.spawnScout = function(energy, targetRoom = undefined, respawnTTL = undefined) {
    if (energy < 50) {
        return ERR_NOT_ENOUGH_RESOURCES;
    }

    let body = [MOVE];
    let opts = {
        memory: {
            role: ROLE.SCOUT,
            spawnRoom: this.room.name,
            targetRoomName: targetRoom,
            task: TASK.DISABLE_ATTACK_NOTIFICATION,
            respawnTTL: respawnTTL, // if we want to annoy some early rcl safemode-room
        }
    };

    return this._spawnDefinedCreep(ROLE.SCOUT, body, opts);
};

Spawn.prototype.spawnScoutWithAttackPart = function(energy, targetRoom = undefined, respawnTTL = undefined) {
    if (energy < 130) {
        return ERR_NOT_ENOUGH_RESOURCES;
    }

    let body = [ATTACK, MOVE];
    let opts = {
        memory: {
            role: ROLE.SCOUT_WITH_ATTACK_PART,
            spawnRoom: this.room.name,
            targetRoomName: targetRoom,
            task: TASK.DISABLE_ATTACK_NOTIFICATION,
            respawnTTL: respawnTTL, // if we want to annoy some early rcl safemode-room
        }
    };

    return this._spawnDefinedCreep(ROLE.SCOUT_WITH_ATTACK_PART, body, opts);
};

const roleNames = require('globals.rolenames');
Spawn.prototype._spawnDefinedCreep = function(role, body, opts) {
    let name = roleNames.getRoleName(role) + (Memory.creepsBuilt % 1000);

    let result = this.spawnCreep(body, name, opts);

    switch (result) {
        case OK:
            Memory.creepsBuilt = Memory.creepsBuilt + 1;
            this.room.refreshFreeExtensionsInNextTick();
            break;
        case ERR_NOT_ENOUGH_ENERGY:
            break;
        default:
            log.warning(this.room + " unexpected error when spawning creep: " + this.spawnCreep(body, name, opts)
                + "\nBody: " + body.length + " -> " + body + "\nname:" + name + "\nmemory:" + opts);
            break;
    }

    return result;
};