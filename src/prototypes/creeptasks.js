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
        this.setTask(TASK.STORE_ENERGY);
    }

    if (target instanceof Structure) {
        this._withdrawEnergy(target, taskWhenFinished);
    } else {
        this._pickupEnergy(target, taskWhenFinished);
    }
};

Creep.prototype.collectEnergy = function(taskWhenFinished) {
    let storage;
    if (this.room.memory.allowEnergyCollection) {
        storage = this.findClosestFilledEnergyStructure();
    } else {
        storage = this.findClosestFilledContainerOrStorage();
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
    let constructionSite = this._getConstructionSite(this);

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
        default:
            console.log("unexpected error when building object: " + this.build(constructionSite));
            break;
    }
};

Creep.prototype.repairStructures = function(taskIfNothingToRepair) {
    let damagedStructure = this._getDamagedStructure(this);

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

Creep.prototype.moveOntoContainer = function() {
    let targetPos = this._getSource().getContainerPosition();

    if (targetPos === ERR_NOT_FOUND) {
        this.say("x~x");
        return;
    }

    this.moveTo(targetPos);
    if(this.pos.isEqualTo(targetPos)) {
        this.memory.task = TASK.HARVEST_ENERGY;
    }
};

Creep.prototype.determineHarvesterStartTask = function() {
    let source = this._getSource();
    if (source === ERR_NOT_FOUND) {
        this.say("*zZz*");
        return;
    }

    let container = source.getContainerPosition();
    if (container === ERR_NOT_FOUND) {
        this.memory.task = TASK.HARVEST_ENERGY;
    } else {
        this.memory.task = TASK.MOVE_ONTO_CONTAINER;
    }

};