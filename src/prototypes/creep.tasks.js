Creep.prototype.harvestEnergyInBase = function() {
    let source = this._getSource();

    if (source === ERR_NOT_FOUND) {
        this.say(creepTalk.noSourceAvailable);
        return;
    }

    switch (this.harvest(source)) {
        case OK:
            if (this.carry[RESOURCE_ENERGY] >= CARRY_CAPACITY - 10 && source.nearbyLink) {
                this.transfer(source.nearbyLink, RESOURCE_ENERGY, CARRY_CAPACITY);

                if (source.nearbyLink.energy >= source.nearbyLink.energyCapacity - CARRY_CAPACITY) {
                    if (this.room.controllerLink && this.room.controllerLink.energy < 700) {
                        source.nearbyLink.transferEnergy(this.room.controllerLink);
                        break;
                    }

                    if (this.room.storageLink && this.room.storageLink.energy < 700) {
                        source.nearbyLink.transferEnergy(this.room.storageLink);
                        break;
                    }
                }
            }
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(source, {maxRooms:  1});
            break;
        case ERR_NO_BODYPART:
            this.suicide();
            break;
        default:
            this.logActionError("harvestEnergyInBase on source " + source, + this.harvest(source));
            break;
    }
};

Creep.prototype.harvestEnergyInLowRCLRoom = function(taskWhenFinishedOrEmptySource) {
    let source;
    if (this.memory.taskTargetId) {
        source = Game.getObjectById(this.memory.taskTargetId)
    }

    if (!source) {
        let availableSources = this.room.sources.filter(source => source.energy > 0);

        let total = 0;
        let randomValues = [];

        for (let s of availableSources) {
            total += s.freeTileCount;
            randomValues.push(total);
        }

        let randomValue = _.random(1, total);

        for (let i = 0; i < randomValues.length; i++) {
            if (randomValue <= randomValues[i]) {
                source = availableSources[i];
                break;
            }
        }

        if (!source) {
            log.warning("something went wrong. random values: " + randomValues + ", total: " + total + " random value: " + randomValue);
        }

        this.memory.taskTargetId = source.id;
    }

    if (!source) {
        this.say(creepTalk.noSourceAvailable);
        return;
    }

    switch (this.harvest(source)) {
        case OK:
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            this.setTask(taskWhenFinishedOrEmptySource);
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(source, {maxRooms:  1});
            break;
        case ERR_NO_BODYPART:
            this.suicide();
            break;
        default:
            this.logActionError("harvestEnergyInLowRCLRoom on source " + source, + this.harvest(source));
            break;
    }
};

Creep.prototype.harvestMineral = function() {
    let mineral = this.room.mineral;

    if (mineral === ERR_NOT_FOUND) {
        this.say(creepTalk.noSourceAvailable);
    }

    switch (this.harvest(mineral)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(mineral, {maxRooms: 1});
            break;
        case ERR_TIRED:
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            this.suicide();
            break;
        default:
            this.logActionError("harvestMineral on mineral " + mineral, this.harvest(mineral));
            break;
    }
};

Creep.prototype.harvestEnergyInRemoteRoom = function() {
    let source = this._getSource();

    if (source === ERR_NOT_FOUND) {
        this.say(creepTalk.noSourceAvailable);
        return;
    }

    switch (this.harvest(source)) {
        case OK:
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(source, {maxRooms: 1});
            break;
        case ERR_NO_BODYPART:
            this.suicide();
            break;
        default:
            this.logActionError("harvestingEnergyFetch on source " + source, this.harvest(source));
            break;
    }

    if (_.sum(this.carry) === this.carryCapacity) {
        if (source.nearbyContainer) {
            if (source.nearbyContainer.hits < source.nearbyContainer.hitsMax) {
                if (!this.repair(source.nearbyContainer)) {
                    this.travelTo(source.nearbyContainer, {maxRooms: 1});
                }
                this.say(creepTalk.repairContainer, true);
            }
        } else {
            let constructionSites = this.room.lookForAt(LOOK_CONSTRUCTION_SITES, this.pos);
            if (constructionSites.length > 0) {
                this.build(constructionSites[0]);
            }
        }
    }
};

Creep.prototype.harvestEnergyAndWork = function(taskWhenFinished) {
    let source = this._getSource();

    if (source === ERR_NOT_FOUND) {
        this.say(creepTalk.noSourceAvailable);
        return;
    }

    switch (this.harvest(source)) {
        case OK:
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            source.memory.workersAssigned--;
            this.setTask(taskWhenFinished);
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(source, {maxRooms: 1});
            break;
        case ERR_NO_BODYPART:
            this.suicide();
            break;
        default:
            this.logActionError("harvestingEnergyFetch on source " + source, this.harvest(source));
            break;
    }

    if (_.sum(this.carry) === this.carryCapacity) {
        if (source.nearbyContainer) {
            if (source.nearbyContainer.hits < source.nearbyContainer.hitsMax) {
                this.repair(source.nearbyContainer);
                this.say(creepTalk.repairContainer, true);
                return;
            }
        }

        source.memory.workersAssigned--;
        this.setTask(taskWhenFinished);
    }
};

Creep.prototype.haulEnergy = function(taskWhenFinished) {
    let target = this._getEnergyHaulTarget();

    if (target === ERR_NOT_FOUND) {
        this.setTask(taskWhenFinished);
        return ERR_NOT_FOUND;
    }

    if (target instanceof Structure || target instanceof Tombstone) {
        this._withdrawResource(target, taskWhenFinished);
    } else {
        this._pickupEnergy(target, taskWhenFinished);
    }
};

Creep.prototype.haulAnyResource = function(taskWhenFinished) {
    let target = this._getAnyResourceHaulTarget();

    if (target === ERR_NOT_FOUND) {
        this.setTask(taskWhenFinished);
    }

    if (target instanceof Structure || target instanceof Tombstone) {
        this._withdrawResource(target, taskWhenFinished);
    } else {
        this._pickupEnergy(target, taskWhenFinished);
    }
};

Creep.prototype.collectEnergy = function(taskWhenFinished) {
    let energyStorage;

    if (this.memory.taskTargetId) {
        energyStorage = Game.getObjectById(this.memory.taskTargetId);
        // TODO check sufficient storage remaining?
    }

    if (!energyStorage) {
        if (this.room.memory.allowEnergyCollection) {
            energyStorage = this.findClosestFilledEnergyStructure();
        } else {
            energyStorage = this.findClosestFilledEnergyStorage();
        }

        this.memory.taskTargetId = energyStorage.id;
    }

    if (energyStorage === ERR_NOT_FOUND) {
        this.say(creepTalk.noEnergyStorage);
        return;
    }

    this._withdrawEnergy(energyStorage, taskWhenFinished);
};

Creep.prototype.renew = function(taskWhenFinished) {
    let spawn = this.pos.findClosestByPath(FIND_MY_SPAWNS);

    switch (spawn.renewCreep(this)) {
        case OK:
            break;
        case ERR_BUSY:
            break;
        case ERR_NOT_ENOUGH_ENERGY:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(spawn);
            break;
        case ERR_FULL:
            this.memory.task = taskWhenFinished;
            break;
        default:
            this.logActionError("renewing creep", spawn.renewCreep(this));
    }
};

Creep.prototype.upgradeRoomController = function(taskWhenFinished, stuckValue = 2) {
    switch (this.upgradeController(this.room.controller)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(this.room.controller, {maxRooms: 1, range: 2, stuckValue: stuckValue});
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            this.setTask(taskWhenFinished);
            break;
        case ERR_NOT_OWNER:
        case ERR_INVALID_TARGET:
            if (!this.memory.targetRoomName) {
                this.memory.targetRoomName = this.memory.spawnRoom;
            }

            this.setTask(TASK.MOVE_TO_ROOM);
            break;
        default:
            this.logActionError("upgrading controller", this.upgradeController(this.room.controller));
            break;
    }
};

Creep.prototype.buildStructures = function(taskIfNothingToBuild, taskWhenNotEnoughEnergy = TASK.COLLECT_ENERGY, waitForNextConstructionSite = false) {
    let constructionSite = this._getConstructionSite();

    if (constructionSite === ERR_NOT_FOUND) {
        this.say(creepTalk.noTargetFound);
        this.setTask(taskIfNothingToBuild);
        return;
    }
    if (constructionSite === ERR_CONSTRUCTION_WILL_BE_PLACED_NEXT_TICK) {
        if (waitForNextConstructionSite) {
            this.say(creepTalk.waitingForSomething, true);
            return;
        } else  {
            this.say(creepTalk.noTargetFound);
            this.setTask(taskIfNothingToBuild);
            return
        }
    }

    switch (this.build(constructionSite)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(constructionSite, {maxRooms: 1});
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            this.setTask(taskWhenNotEnoughEnergy);
            break;
        case ERR_INVALID_TARGET:
            this.resetCurrentTask();
            break;
        case ERR_RCL_NOT_ENOUGH:
            this.logActionError("Insufficient RCL to build " + constructionSite, ERR_RCL_NOT_ENOUGH);
            this.setTask(taskIfNothingToBuild);
            break;
        default:
            this.logActionError("building object", this.build(constructionSite));
            break;
    }
};

Creep.prototype.repairStructures = function(taskIfNothingToRepair, taskIfNoRessources = TASK.COLLECT_ENERGY, percentageToCountAsDamaged = 0.7, sortByRange = false) {
    let damagedStructure = this._getDamagedStructure(percentageToCountAsDamaged, sortByRange);

    if (damagedStructure === ERR_NOT_FOUND) {
        this.say(creepTalk.noTargetFound);
        this.setTask(taskIfNothingToRepair);
        return;
    }

    switch (this.repair(damagedStructure)) {
        case OK:
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            this.setTask(taskIfNoRessources);
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(damagedStructure, {maxRooms: 1});
            break;
        default:
            this.logActionError("repairing object", this.repair(damagedStructure));
            break;
    }
};

Creep.prototype.storeEnergy = function(nextTask, taskWhenNoStorageFound = undefined) {
    const structureThatRequiresEnergy = this._getEnergyStorage();

    if (structureThatRequiresEnergy === ERR_NOT_FOUND) {
        if (taskWhenNoStorageFound) {
            this.setTask(taskWhenNoStorageFound);
            return;
        }

        this.say(creepTalk.noTargetFound);
        return;
    }

    switch (this.transfer(structureThatRequiresEnergy, RESOURCE_ENERGY)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(structureThatRequiresEnergy, {maxRooms: 1});
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            if (_.sum(this.carry) === 0) {
                this.setTask(nextTask);
            } else {
                this.memory.hauledResourceType = Object.keys(this.carry).filter(name => name !== RESOURCE_ENERGY)[0];
                this.memory.taskTargetId = undefined;
            }
            break;
        case ERR_FULL:
            this.resetCurrentTask();
            break;
        default:
            this.logActionError("transferring energy: ", this.transfer(structureThatRequiresEnergy, RESOURCE_ENERGY));
            break;
    }
};

Creep.prototype.storeMineral = function(nextTask) {
    let hauledResourceType;

    for (let resourceName in this.carry) {
        if (this.carry[resourceName] > 0) {
            hauledResourceType = resourceName;
            break;
        }
    }

    const mineralStorage = this._getMineralStorage(hauledResourceType);

    if (mineralStorage === ERR_NOT_FOUND) {
        this.say(creepTalk.noTargetFound);
        this.setTask(nextTask);
        return;
    }

    switch (this.transfer(mineralStorage, hauledResourceType)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(mineralStorage, {maxRooms: 1});
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            if (_.sum(this.carry) === 0) {
                this.setTask(nextTask);
            }
            break;
        case ERR_FULL:
            this.logActionError("storing resource " + hauledResourceType + " in " + mineralStorage, "ERR_FULL");
            this.drop(hauledResourceType);
            break;
        case ERR_INVALID_ARGS:
            if (_.sum(this.carry) === 0) {
                this.setTask(nextTask);
            }
            break;
        case ERR_INVALID_TARGET:
            this.say(creepTalk.invalidTarget);
            this.logActionError("invalid target store mineral: " + mineralStorage, ERR_INVALID_TARGET);
            this.setTask(TASK.MOVE_TO_ROOM);
            break;
        default:
            this.logActionError("storing resource", this.transfer(mineralStorage, hauledResourceType));
            break;
    }
};

const signs = Memory.signs;
Creep.prototype.signRoomController = function(nextTask) {
    let text = this.room.controller.level > 1 ? signs.claimed
                                              : signs.reserved;

    if (this.room.controller.level > 1 && Game.shard.name === "screepsplus1") {
        text = "Testing full automation - survived " + (Game.time - 2393452) + " ticks! x)";
    }

    if (this.room.controller.sign !== undefined) {
        if (this.room.controller.sign.text === text) {
            this.setTask(nextTask);
            return;
        }
    }

    switch (this.signController(this.room.controller, text)) {
        case OK:
            this.setTask(nextTask);
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(this.room.controller, {maxRooms: 1});
            break;
        default:
            this.setTask(nextTask);
            this.logActionError("signing controller", this.signController(this.room.controller, text));
            break;
    }
};

Creep.prototype.moveOntoContainer = function(taskWhenFinished) {
    let source = this._getSource();
    if (source === ERR_NOT_FOUND) {
        this.say(creepTalk.noSourceAvailable);
        return;
    }

    let targetPos = source.getNearbyContainerPosition();

    if (targetPos === ERR_NOT_FOUND) {
        source.forceNearbyContainerReload();
        targetPos = source.getNearbyContainerPosition();
        if (targetPos === ERR_NOT_FOUND) {
            targetPos = source.getNearbyContainerConstructionSitePosition();
            if (targetPos === ERR_NOT_FOUND) {
                targetPos = source.placeContainerConstructionSiteAndGetItsPosition(this.pos);
                if (targetPos === ERR_INVALID_ARGS) {
                    log.warning(this + "unable to place source container!");
                    targetPos = source.pos;
                }
            }
        }
    }

    this.travelTo(targetPos, {maxRooms: 1, range: 0});
    if(this.pos.isEqualTo(targetPos)) {
        this.memory.task = taskWhenFinished;
    }
};

Creep.prototype.moveOntoMineralContainer = function(taskWhenFinished) {
    let mineral = this.room.mineral;
    if (!mineral) {
        this.say(creepTalk.noTargetFound);
        return;
    }

    let targetPos = mineral.getNearbyContainerPosition();

    if (targetPos === ERR_NOT_FOUND) {
        this.memory.task = taskWhenFinished;
        return;
    }

    this.travelTo(targetPos, {maxRooms: 1});
    if(this.pos.isEqualTo(targetPos)) {
        this.memory.task = taskWhenFinished;
    }
};

Creep.prototype.determineHarvesterStartTask = function(taskWhenNoContainerAvailable) {
    if (this.memory.targetRoomName && this.room.name !== this.memory.targetRoomName) {
        this.setTask(TASK.MOVE_TO_ROOM);
        return;
    }

    let source = this._getSource();
    if (source === ERR_NOT_FOUND) {
        this.say(creepTalk.waitingForGoodWeather);
        if (this.ticksToLive < 1200 && this.ticksToLive > 1100) {
            log.info(this.room.name + " Harvester without energy source?!\n" + this + " --> " + JSON.stringify(this));
        }
        return;
    }

    return this.memory.task = TASK.MOVE_ONTO_CONTAINER;
};

Creep.prototype.moveToRoom = function(taskWhenFinished) {
    const roomName = this.memory.targetRoomName;

    if (this.room.name === roomName) {
        this.setTask(taskWhenFinished);
    }

    const positionInNextRoom = new RoomPosition(28, 25, roomName);
    this.travelTo(positionInNextRoom);
};

Creep.prototype.dismantleStructure = function(taskWhenFinished) {
    const target = this._getDismantleTarget();

    if (target === ERR_NOT_FOUND) {
        if (taskWhenFinished) {
            this.setTask(taskWhenFinished);
        }
        return ERR_NOT_FOUND;
    }

    switch (this.dismantle(target)) {
        case OK:
            if (_.sum(this.carry) === this.carryCapacity) {
                this.drop(RESOURCE_ENERGY);
            }
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(target);
            break;
        default:
            this.logActionError("dismantling object", this.dismantle(target));
            break;
    }
    return OK;
};

Creep.prototype.claimRoomController = function() {
    switch (this.claimController(this.room.controller)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(this.room.controller);
            break;
        case ERR_GCL_NOT_ENOUGH:
            this.setTask(TASK.RESERVE_CONTROLLER);
            this.reserveRoomController();
            break;
        default:
            this.logActionError("claiming room controller", this.claimController(this.room.controller));
            break;
    }
};

Creep.prototype.attackRoomController = function() {
    switch (this.attackController(this.room.controller)) {
        case OK:
            if (this.room.name === 'E52S43') {
                this.memory.targetRoomName = 'E53S44';
                this.setTask(TASK.MOVE_TO_ROOM);
            } else if (this.room.name === 'E53S44') {
                this.memory.targetRoomName = 'E52S43';
                this.setTask(TASK.MOVE_TO_ROOM);
            } else {
                this.suicide();
            }
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(this.room.controller);
            break;
        case ERR_GCL_NOT_ENOUGH:
            this.setTask(TASK.RESERVE_CONTROLLER);
            this.reserveRoomController();
            break;
        case ERR_TIRED:
            break;
        case ERR_INVALID_TARGET:
            this.reserveController(this.room.controller);
            break;
        default:
            this.logActionError("attacking room controller", this.attackController(this.room.controller));
            break;
    }
};

Creep.prototype.reserveRoomController = function() {
    switch (this.reserveController(this.room.controller)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(this.room.controller, {maxRooms: 1});
            break;
        case ERR_INVALID_TARGET:
            this.setTask(TASK.DECIDE_WHAT_TO_DO);
            break;
        default:
            this.logActionError("reserving room controller", this.reserveController(this.room.controller));
            break;
    }
};

Creep.prototype.recycle = function() {
    let spawn;
    if (this.memory.taskTargetId) {
        spawn = Game.getObjectById(this.memory.taskTargetId);
    } else {
        spawn = this.room.find(FIND_MY_SPAWNS)[0];
        this.memory.taskTargetId = spawn.id;
    }

    switch(spawn.recycleCreep(this)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(spawn);
            break;
        default:
            this.logActionError("recycling creep", spawn.recycleCreep(this));
            break;
    }
};

Creep.prototype.defendRoomByChargingIntoEnemy = function() {
    let target = undefined;
    if (this.memory.taskTargetId) {
        target = Game.getObjectById(this.memory.taskTargetId);
    }

    if (target === undefined) {
        let possibleTargets = this.room.find(FIND_HOSTILE_CREEPS);
        if (possibleTargets.length === 0) {
            this.say(creepTalk.victory, true);
            if (this.countBodyPartsOfType(HEAL) === 0) {
                this.memory.targetRoomName = this.memory.homeRoomName;
                this.setTask(TASK.DECIDE_WHAT_TO_DO);
            } else if (this.room !== this.memory.targetRoomName) {
                this.setTask(TASK.MOVE_TO_ROOM)
            }
            return ERR_NOT_FOUND;
        }

        target = utility.getClosestObjectFromArray(this, possibleTargets);
    }

    let result = this.attack(target);
    switch (result) {
        case OK:
            this.say(creepTalk.tableFlip, true);
            break;
        case ERR_NOT_IN_RANGE:
            this.say(creepTalk.chargeAttack, true);
            this.travelTo(target, {maxRooms: 1});
            break;
        case ERR_INVALID_TARGET:
            this.memory.taskTargetId = undefined;
            break;
        default:
            this.logActionError("defendRoomByStandingOnRamparts attack command", this.attack(target));
            break;
    }
    return result;
};

Creep.prototype.defendRoomByStandingOnRamparts = function() {
    let target = undefined;
    if (this.memory.taskTargetId) {
        target = Game.getObjectById(this.memory.taskTargetId);
    }

    if (target === undefined) {
        let possibleTargets = this.room.find(FIND_HOSTILE_CREEPS);
        if (possibleTargets.length === 0) {
            this.say(creepTalk.waitingForGoodWeather);
            return;
        }

        target = utility.getClosestObjectFromArray(this, possibleTargets);
    }

    switch (this.attack(target)) {
        case OK:
            this.say(creepTalk.tableFlip, true);
            break;
        case ERR_NOT_IN_RANGE:
            this.moveToRampartClosestToEnemy(target);
            break;
        case ERR_INVALID_TARGET:
            this.memory.taskTargetId = undefined;
            break;
        default:
            this.logActionError("defendRoomByStandingOnRamparts attack command", this.attack(target));
            break;
    }
};

Creep.prototype.moveToRampartClosestToEnemy = function(enemy) {
    let ramparts = this.room.myRamparts;

    if (ramparts.length === 0) {
        this.say(creepTalk.chargeAttack, true);
        this.travelTo(enemy, {maxRooms: 1});
        this.task = TASK.DEFEND_MELEE_CHARGE;
        return;
    }

    let closestRampart = utility.getClosestObjectFromArray(enemy, ramparts);

    this.travelTo(closestRampart, {maxRooms: 1, range: 0});
};

Creep.prototype.selectNextRoomToScout = function() {
    const exits = Game.map.describeExits(this.room.name);
    const rooms = [];

    for (let direction in exits) {
        rooms.push(exits[direction]);
    }

    const targetRoom = rooms.reduce((acc, room) => {
        if (!Game.map.isRoomAvailable(acc)) {
            return room;
        }

        if (!Game.map.isRoomAvailable(room)) {
            return acc;
        }

        const accMemory  = Memory.rooms[acc];

        // Check if acc has priority
        if (accMemory === undefined) {
            return acc;
        }

        if (accMemory.isAlreadyScouted) {
            return room;
        }

        if (accMemory.lastScouted === undefined) {
            return acc;
        }

        // Check if room has priority
        const roomMemory = Memory.rooms[room];
        if (roomMemory === undefined) {
            return room;
        }

        if (roomMemory.isAlreadyScouted) {
            return acc;
        }

        if (roomMemory.lastScouted === undefined) {
            return room;
        }

        // Just return the one with the oldest entry
        if (accMemory.lastScouted < roomMemory.lastScouted) {
            return acc;
        } else {
            return room;
        }
    });

    if (!Memory.rooms[targetRoom]) {
        Memory.rooms[targetRoom] = {};
    }

    Memory.rooms[targetRoom].isAlreadyScouted = true;
    this.memory.targetRoomName = targetRoom;
};

Creep.prototype.stepOntoHostileConstructionSites = function() {
    const target = this._getClosestHostileConstructionSite();
    if (target === ERR_NOT_FOUND) {
        return ERR_NOT_FOUND;
    }

    this.travelTo(target, {range: 0});
    return OK;
};