Creep.prototype.harvestEnergy = function() {
    let source = this._getSource();

    if (source === ERR_NOT_FOUND) {
        this.say("x~x");
        return;
    }

    switch (this.harvest(source)) {
        case OK:
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(source);
            break;
        case ERR_NO_BODYPART:
            this.suicide();
            break;
        default:
            this.logActionError("harvestEnergy on source " + source, + this.harvest(source));
            break;
    }
};

Creep.prototype.harvestMineral = function() {
    let mineral = this.room.mineral;

    if (mineral === ERR_NOT_FOUND) {
        this.say("no mineral");
    }

    switch (this.harvest(mineral)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(mineral);
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

Creep.prototype.harvestEnergyAndFetch = function(taskWhenFinished) {
    let source = this._getSource();

    if (source === ERR_NOT_FOUND) {
        this.say("x~x");
        return;
    }

    switch (this.harvest(source)) {
        case OK:
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(source);
            break;
        case ERR_NO_BODYPART:
            this.suicide();
            break;
        default:
            this.logActionError("harvestingEnergyFetch on source " + source, this.harvest(source));
            break;
    }

    if (this.carry.energy === this.carryCapacity) {
        source.memory.workersAssigned--;
        this.setTask(taskWhenFinished);
    }
};

Creep.prototype.haulEnergy = function(taskWhenFinished) {
    let target = this._getEnergyHaulTarget();

    if (target === ERR_NOT_FOUND) {
        this.setTask(taskWhenFinished);
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
        this.say("q-q");
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

Creep.prototype.upgradeRoomController = function(taskWhenFinished) {
    switch (this.upgradeController(this.room.controller)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(this.room.controller);
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

Creep.prototype.buildStructures = function(taskIfNothingToBuild, taskWhenNotEnoughEnergy = TASK.COLLECT_ENERGY) {
    let constructionSite = this._getConstructionSite();

    if (constructionSite === ERR_NOT_FOUND) {
        this.say('x~x');
        this.setTask(taskIfNothingToBuild);
        return;
    }

    switch (this.build(constructionSite)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(constructionSite);
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
        this.say('x~x');
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
            this.travelTo(damagedStructure);
            break;
        default:
            this.logActionError("repairing object", this.repair(damagedStructure));
            break;
    }
};

Creep.prototype.storeEnergy = function(nextTask) {
    const structureThatRequiresEnergy = this._getEnergyStorage();

    if (structureThatRequiresEnergy === ERR_NOT_FOUND) {
        this.say('x~x');
        return;
    }

    switch (this.transfer(structureThatRequiresEnergy, RESOURCE_ENERGY)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(structureThatRequiresEnergy);
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            if (_.sum(this.carry) === 0) {
                this.setTask(nextTask);
            } else {
                this.memory.hauledResourceType = Object.keys(this.carry).filter(name => name !== RESOURCE_ENERGY)[0];
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
    const mineralStorage = this._getMineralStorage();

    switch (this.transfer(mineralStorage, this.memory.hauledResourceType)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(mineralStorage);
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            if (_.sum(this.carry) === 0) {
                this.setTask(nextTask);
            } else {
                this.memory.hauledResourceType = Object.keys(this.carry).filter(name => name !== this.memory.hauledResourceType)[0];
            }
            break;
        case ERR_FULL:
            this.logActionError("TERMINAL FULL", "ERR_FULL");
            this.drop(this.memory.hauledResourceType);
            break;
        case ERR_INVALID_ARGS:
            if (_.sum(this.carry) === 0) {
                this.setTask(nextTask);
            } else {
                this.memory.hauledResourceType = Object.keys(this.carry).filter(name => name !== this.memory.hauledResourceType)[0];
            }
            break;
        case ERR_INVALID_TARGET:
            this.say("WAT");
            this.setTask(TASK.MOVE_TO_ROOM);
            break;
        default:
            this.logActionError("storing resource", this.transfer(mineralStorage, this.memory.hauledResourceType));
            break;
    }
};

Creep.prototype.signRoomController = function(nextTask) {
    let text = this.room.controller.level > 1 ? "Hello World! Embrace the most inefficient code ever. ^-^"
                                              : "🍪";

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
            this.travelTo(this.room.controller);
            break;
        default:
            this.setTask(nextTask);
            this.logActionError("signing controller", this.signController(this.room.controller, text));
            break;
    }
};

Creep.prototype.moveOntoContainer = function(taskWhenFinished) {
    let source = this._getSource();
    if (!source) {
        this.say("e~e");
        return;
    }

    let targetPos = source.getContainerPosition();

    if (targetPos === ERR_NOT_FOUND) {
        this.say("x~x");
        return;
    } else {
        this.memory.containerId = source.memory.containerId;
    }

    this.travelTo(targetPos);
    if(this.pos.isEqualTo(targetPos)) {
        this.memory.task = taskWhenFinished;
    }
};

Creep.prototype.moveOntoMineralContainer = function(taskWhenFinished) {
    let mineral = this.room.mineral;
    if (!mineral) {
        this.say("e~e");
        return;
    }

    let targetPos = mineral.getContainerPosition();

    if (targetPos === ERR_NOT_FOUND) {
        this.memory.task = taskWhenFinished;
        return;
    }

    this.travelTo(targetPos);
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
        this.say("*zZz*");
        if (this.ticksToLive < 1200) {
            console.log(this.room.name + " Harvester without energy source?!\n" + this + " --> " + JSON.stringify(this));
        }
        return;
    }

    let containerPosition = source.getContainerPosition();
    if (containerPosition === ERR_NOT_FOUND) {
        this.memory.task = taskWhenNoContainerAvailable;
    } else {
        if (source.memory.workersMax > 1) {
            return this.memory.task = taskWhenNoContainerAvailable;
        } else {
            return this.memory.task = TASK.MOVE_ONTO_CONTAINER;
        }
    }

};

Creep.prototype.moveToRoom = function(taskWhenFinished) {
    const roomName = this.memory.targetRoomName;

    if (this.room.name === roomName) {
        this.setTask(taskWhenFinished);
    }

    const positionInNextRoom = new RoomPosition(25, 25, roomName);
    this.travelTo(positionInNextRoom);
};

Creep.prototype.dismantleStructure = function(taskWhenFinished) {
    const target = this._getDismantleTarget();

    if (target) {
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
    } else {
        this.setTask(taskWhenFinished);
    }
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
            this.logActionError("attaclomg room controller", this.attackController(this.room.controller));
            break;
    }
};

Creep.prototype.reserveRoomController = function() {
    switch (this.reserveController(this.room.controller)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(this.room.controller);
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
            this.say("\\(^-^)/", true);
            this.memory.targetRoomName = this.memory.homeRoomName;
            this.setTask(TASK.DECIDE_WHAT_TO_DO);
            return;
        }

        _.sortBy(possibleTargets, c => this.pos.getRangeTo(c));
        target = possibleTargets[0];
    }

    switch (this.attack(target)) {
        case OK:
            this.say("(ノ°Д°）ノ︵┻━┻", true);
            break;
        case ERR_NOT_IN_RANGE:
            this.say("FOR GLORY!", true);
            this.travelTo(target);
            break;
        case ERR_INVALID_TARGET:
            this.memory.taskTargetId = undefined;
            break;
        default:
            this.logActionError("defendRoomByStandingOnRamparts attack command", this.attack(target));
            break;
    }
};

Creep.prototype.defendRoomByStandingOnRamparts = function() {
    let target = undefined;
    if (this.memory.taskTargetId) {
        target = Game.getObjectById(this.memory.taskTargetId);
    }

    if (target === undefined) {
        let possibleTargets = this.room.find(FIND_HOSTILE_CREEPS);
        if (possibleTargets.length === 0) {
            this.say("*zZz*");
            return;
        }

        _.sortBy(possibleTargets, c => this.pos.getRangeTo(c));
        target = possibleTargets[0];
    }

    switch (this.attack(target)) {
        case OK:
            this.say("(ノ°Д°）ノ︵┻━┻", true);
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
    let ramparts = this.room.find(FIND_MY_STRUCTURES, {filter: structure => structure.structureType === STRUCTURE_RAMPART});

    if (ramparts.length === 0) {
        this.say("FOR GLORY", true);
        this.travelTo(enemy);
        this.task = TASK.DEFEND_MELEE_CHARGE;
        return;
    }

    ramparts = _.sortBy(ramparts, rampart => rampart.pos.getRangeTo(enemy.pos));

    switch (this.travelTo(ramparts[0])) {
        case OK:
            this.say("NOT TODAY!", true);
            break;
        default:
            this.logActionError("moveToRampartClosestToEnemy moveTo command", this.travelTo(ramparts[0]));
            break;
    }
};