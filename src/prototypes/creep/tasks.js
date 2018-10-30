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
    if (this.taskTargetId) {
        source = Game.getObjectById(this.taskTargetId)
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

        this.taskTargetId = source.id;
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
    let target;
    if (this.room.controller && this.room.controller.my) {
        target = this._getAnyResourceHaulTargetInOwnedRoom();
    } else {
        target = this._getAnyResourceHaulTargetInRemoteRoom();
    }

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

    if (this.taskTargetId) {
        energyStorage = Game.getObjectById(this.taskTargetId);
        // TODO check sufficient storage remaining?
    }

    if (!energyStorage) {
        if (this.room.memory.allowEnergyCollection) {
            energyStorage = this.findClosestFilledEnergyStructure();
        } else {
            energyStorage = this.findClosestFilledEnergyStorage();
        }

        this.taskTargetId = energyStorage.id;
    }

    if (energyStorage === ERR_NOT_FOUND) {
        this.say(creepTalk.noEnergyStorage);
        return ERR_NOT_FOUND;
    }

    return this._withdrawEnergy(energyStorage, taskWhenFinished);
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
            this.task = taskWhenFinished;
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
            if (!this.targetRoomName) {
                this.targetRoomName = this.spawnRoom;
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
                this.hauledResourceType = Object.keys(this.carry).filter(name => name !== RESOURCE_ENERGY)[0];
                this.taskTargetId = undefined;
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
        this.drop();
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
            if (Game.rooms[this.spawnRoom].controller.level > 2) {
                targetPos = source.placeContainerConstructionSiteAndGetItsPosition(this.pos);
                if (targetPos === ERR_INVALID_ARGS) {
                    log.warning(this + "unable to place source container!");
                    targetPos = source.pos;
                    this.task = taskWhenFinished;
                }
            } else {
                this.task = taskWhenFinished;
                return;
            }
        }
    }

    this.travelTo(targetPos, {maxRooms: 1, range: 0});
    if(this.pos.isEqualTo(targetPos)) {
        this.task = taskWhenFinished;
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
        mineral.forceNearbyContainerReload();
        targetPos = mineral.getNearbyContainerPosition();
        if (targetPos === ERR_NOT_FOUND) {
            targetPos = mineral.placeContainerConstructionSiteAndGetItsPosition(this.pos);
            if (targetPos === ERR_INVALID_ARGS) {
                log.warning(this + "unable to place mineral container!");
                targetPos = mineral.pos;
            }
        }
    }

    this.travelTo(targetPos, {maxRooms: 1});
    if(this.pos.isEqualTo(targetPos)) {
        this.task = taskWhenFinished;
    }
};

Creep.prototype.determineHarvesterStartTask = function() {
    if (this.targetRoomName && this.room.name !== this.targetRoomName) {
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

    return this.task = TASK.MOVE_ONTO_CONTAINER;
};

Creep.prototype.moveToRoom = function(taskWhenFinished, options = undefined) {
    const roomName = this.targetRoomName;

    if (this.room.name === roomName) {
        this.setTask(taskWhenFinished);
    }

    const positionInNextRoom = new RoomPosition(28, 25, roomName);
    this.travelTo(positionInNextRoom, options);
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
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(target, {maxRooms: 1});
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
                this.targetRoomName = 'E53S44';
                this.setTask(TASK.MOVE_TO_ROOM);
            } else if (this.room.name === 'E53S44') {
                this.targetRoomName = 'E52S43';
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
    if (this.taskTargetId) {
        spawn = Game.getObjectById(this.taskTargetId);
    } else {
        spawn = this.room.find(FIND_MY_SPAWNS)[0];
        this.taskTargetId = spawn.id;
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

Creep.prototype.defendRoomWithMeleeAttacks = function(stayOnRamparts) {
    let target = undefined;
    if (this.taskTargetId) {
        target = Game.getObjectById(this.taskTargetId);
    }

    if (target === undefined) {
        let possibleTargets = this.room.find(FIND_HOSTILE_CREEPS);
        if (possibleTargets.length === 0) {
            this.say(creepTalk.victory, true);
            if (!this.stayInRoom) {
                this.targetRoomName = this.memory.homeRoomName;
                this.setTask(TASK.DECIDE_WHAT_TO_DO);
            } else if (this.room.name !== this.targetRoomName) {
                this.setTask(TASK.MOVE_TO_ROOM)
            }
            return ERR_NOT_FOUND;
        }

        target = utility.getClosestObjectFromArray(this, possibleTargets);
    }

    const result = this.attack(target);
    switch (result) {
        case OK:
            this.say(creepTalk.tableFlip, true);
            break;
        case ERR_NOT_IN_RANGE:
            this.say(creepTalk.chargeAttack, true);
            if (stayOnRamparts) {
                this.moveToRampartClosestToEnemy(target);
            } else {
                this.travelTo(target, {maxRooms: 1, range: 3});
            }
            break;
        case ERR_INVALID_TARGET:
            this.taskTargetId = undefined;
            break;
        default:
            this.logActionError("defendRoomWithMeleeAttacks attack command", this.attack(target));
            break;
    }
    return result;
};

Creep.prototype.defendRoomWithRangedAttacks = function(stayOnRamparts) {
    let target = undefined;
    if (this.taskTargetId) {
        target = Game.getObjectById(this.taskTargetId);
    }

    if (target === undefined) {
        let possibleTargets = this.room.find(FIND_HOSTILE_CREEPS);
        if (possibleTargets.length === 0) {
            this.say(creepTalk.victory, true);
            if (!this.stayInRoom) {
                this.targetRoomName = this.memory.homeRoomName;
                this.setTask(TASK.DECIDE_WHAT_TO_DO);
            } else if (this.room.name !== this.targetRoomName) {
                this.setTask(TASK.MOVE_TO_ROOM)
            }
            return ERR_NOT_FOUND;
        }

        target = utility.getClosestObjectFromArray(this, possibleTargets);
    }

    const rangeToTarget = this.pos.getRangeTo(target);
    if (rangeToTarget === 1) {
        let result = this.rangedMassAttack();
        switch (result) {
            case OK:
                this.say(creepTalk.rangedMassAttack, true);
                break;
            default:
                this.logActionError("defendRoomWithMeleeAttacks while range attacking", this.rangedMassAttack());
                break;
        }
    } else {
        let result = this.rangedAttack(target);
        switch (result) {
            case OK:
                this.say(creepTalk.rangedAttack, true);
                if (!stayOnRamparts) {
                    if (target.countBodyPartsOfType(ATTACK) > 0) {
                        this.kite(target);
                    } else {
                        this.travelTo(target);
                    }
                }
                break;
            case ERR_NOT_IN_RANGE:
                this.say(creepTalk.chargeAttack, true);
                if (stayOnRamparts) {
                    this.moveToRampartClosestToEnemy(target);
                } else {
                    this.travelTo(target, {maxRooms: 1, range: 3});
                }
                break;
            case ERR_INVALID_TARGET:
                this.taskTargetId = undefined;
                break;
            default:
                this.logActionError("defendRoomWithMeleeAttacks attack command", this.rangedAttack(target));
                break;
        }
        return result;
    }
};

Creep.prototype.moveToRampartClosestToEnemy = function(enemy) {
    let ramparts = this.room.myRamparts;

    if (ramparts.length === 0) {
        this.say(creepTalk.chargeAttack, true);
        this.travelTo(enemy, {maxRooms: 1});
        this.task = TASK.DEFEND_CHARGE;
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
    this.targetRoomName = targetRoom;
};

Creep.prototype.stompHostileConstructionSites = function() {
    const target = this._getClosestHostileConstructionSite();
    if (target === ERR_NOT_FOUND) {
        return ERR_NOT_FOUND;
    }

    this.say(creepTalk.blockConstructionSite, true);
    this.travelTo(target, {range: 0});
    return OK;
};