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
            this.moveTo(source);
            break;
        default:
            console.log("unexpected error when harvesting energy: " + this.harvest(source) + " --> " + source);
            break;
    }
    if (this.carry.energy === this.carryCapacity) {
        this.drop(RESOURCE_ENERGY);
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
            this.moveTo(source);
            break;
        default:
            console.log("unexpected error when harvesting energy: " + this.harvest(source) + " --> " + source);
            break;
    }

    if (this.carry.energy === this.carryCapacity) {
        source.memory.workersAssigned--;
        this.setTask(taskWhenFinished);
    }
};

Creep.prototype.haulEnergy = function(taskWhenFinished) {
    let target = this._getHaulTarget();

    if (target === ERR_NOT_FOUND) {
        this.setTask(taskWhenFinished);
    }

    if (target instanceof Structure) {
        this._withdrawEnergy(target, taskWhenFinished);
    } else {
        this._pickupEnergy(target, taskWhenFinished);
    }
};

Creep.prototype.collectEnergy = function(taskWhenFinished) {
    let storage;

    if (this.memory.taskTargetId) {
        storage = Game.getObjectById(this.memory.taskTargetId);
    }

    if (!storage) {
        if (this.room.memory.allowEnergyCollection) {
            storage = this.findClosestFilledEnergyStructure();
        } else {
            storage = this.findClosestFilledContainerOrStorage();
        }

        this.memory.taskTargetId = storage.id;
    }

    if (storage === ERR_NOT_FOUND) {
        this.say("q-q");
        return;
    }

    this._withdrawEnergy(storage, taskWhenFinished);
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
            this.moveTo(spawn);
            break;
        case ERR_FULL:
            this.memory.task = taskWhenFinished;
            break;
        default:
            console.log("unexpected error when renewing creep: " + spawn.renewCreep(creep));
    }
};

Creep.prototype.upgradeRoomController = function(taskWhenFinished) {
    switch (this.upgradeController(this.room.controller)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.moveTo(this.room.controller);
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            this.setTask(this.isRenewNeeded() ? TASK.RENEW_CREEP : taskWhenFinished);
            break;
        default:
            console.log("unexpected error when upgrading controller: " + this.upgradeController(this.room.controller));
            break;
    }
};

Creep.prototype.buildStructures = function(taskIfNothingToBuild) {
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
            this.moveTo(constructionSite);
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            this.setTask(this.isRenewNeeded() ? TASK.RENEW_CREEP : TASK.COLLECT_ENERGY);
            break;
        case ERR_INVALID_TARGET:
            this.resetCurrentTask();
            break;
        case ERR_RCL_NOT_ENOUGH:
            console.log(this.room.name + "insufficient RCL to build " + constructionSite);
            this.setTask(taskIfNothingToBuild);
            break;
        default:
            console.log("unexpected error when building object: " + this.build(constructionSite));
            break;
    }
};

Creep.prototype.repairStructures = function(taskIfNothingToRepair) {
    let damagedStructure = this._getDamagedStructure();

    if (damagedStructure === ERR_NOT_FOUND) {
        this.say('x~x');
        this.setTask(taskIfNothingToRepair);
        return;
    }

    switch (this.repair(damagedStructure)) {
        case OK:
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            this.setTask(this.isRenewNeeded() ? TASK.RENEW_CREEP : TASK.COLLECT_ENERGY);
            break;
        case ERR_NOT_IN_RANGE:
            this.moveTo(damagedStructure);
            break;
        default:
            console.log("unexpected error when repairing object: " + this.repair(damagedStructure));
            break;
    }
};

Creep.prototype.storeEnergy = function(nextTask) {
    const structureThatRequiresEnergy = this._getStorage();

    if (structureThatRequiresEnergy === ERR_NOT_FOUND) {
        this.say('x~x');
        return;
    }

    switch (this.transfer(structureThatRequiresEnergy, RESOURCE_ENERGY)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.moveTo(structureThatRequiresEnergy);
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            this.setTask(this.isRenewNeeded() ? TASK.RENEW_CREEP : nextTask);
            break;
        case ERR_FULL:
            this.resetCurrentTask();
            break;
        default:
            console.log("unexpected error when transferring energy: " + this.transfer(structureThatRequiresEnergy, RESOURCE_ENERGY),
                        + "\n----" + structureThatRequiresEnergy + " ==> " + JSON.stringify(structureThatRequiresEnergy));
            break;
    }
};

Creep.prototype.signRoomController = function(nextTask) {
    let text = "Hello World! Embrace the most inefficient code ever. ^-^";

    if (this.room.controller.sign !== undefined) {
        if (this.room.controller.owner.username === this.room.controller.sign.username) {
            if (this.room.controller.sign.text === text) {
                this.setTask(nextTask);
                return;
            }
        }
    }

    switch (this.signController(this.room.controller, text)) {
        case OK:
            this.setTask(nextTask);
            break;
        case ERR_NOT_IN_RANGE:
            this.moveTo(this.room.controller);
            break;
        default:
            this.setTask(nextTask);
            console.log("unexpected error when signing controller: " + this.transfer(structureThatRequiresEnergy, RESOURCE_ENERGY));
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
    }

    this.moveTo(targetPos);
    if(this.pos.isEqualTo(targetPos)) {
        this.memory.task = taskWhenFinished;
    }
};

Creep.prototype.determineHarvesterStartTask = function(taskWhenNoContainerAvailable) {
    let source = this._getSource();
    if (source === ERR_NOT_FOUND) {
        this.say("*zZz*");
        console.log(this.room.name + " Harvester without energy source?!\n" + this + " --> " + JSON.stringify(this));
        return;
    }

    let containerPosition = source.getContainerPosition();
    if (containerPosition === ERR_NOT_FOUND) {
        this.memory.task = taskWhenNoContainerAvailable;
    } else {
        if (source.memory.workersMax > 1) {
            this.memory.task = taskWhenNoContainerAvailable;
        } else {
            this.memory.task = TASK.MOVE_ONTO_CONTAINER;
        }
    }

};

Creep.prototype.moveToRoom = function(taskWhenFinished) {
    const roomName = this.memory.targetRoomName;

    if (this.room.name === roomName) {
        this.setTask(taskWhenFinished);
    }

    const positionInNextRoom = new RoomPosition(25, 25, roomName);
    this.moveTo(positionInNextRoom);
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
                this.moveTo(target);
                break;
            default:
                console.log("unexpected error when dismantling object: " + this.dismantle(target));
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
            this.moveTo(this.room.controller);
            break;
        case ERR_GCL_NOT_ENOUGH:
            this.setTask(TASK.RESERVE_CONTROLLER);
            this.reserveRoomController();
            break;
        default:
            console.log("unexpected error when claiming room controller: " + this.claimController(this.room.controller));
            break;
    }
};

Creep.prototype.reserveRoomController = function() {
    switch (this.reserveController(this.room.controller)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.moveTo(this.room.controller);
            break;
        case ERR_INVALID_TARGET:
            this.setTask(TASK.DECIDE_WHAT_TO_DO);
            break;
        default:
            console.log(this.room + "|" + this.name + "-- unexpected error when reserving room controller: " + this.reserveController(this.room.controller));
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
            this.moveTo(spawn);
            break;
        default:
            console.log("unexpected error when recycling creep: " + spawn.recycleCreep(this));
            break;
    }
};