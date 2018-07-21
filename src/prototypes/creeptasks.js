Creep.prototype.harvestEnergyAndFetch = function(taskWhenFinished) {
    let source = this._getSource(false);

    if (source === ERR_NOT_FOUND) {
        this.say("NO SOURCE");
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

Creep.prototype.harvestEnergy = function() {
    let source = this._getSource(true);

    if (source === ERR_NOT_FOUND) {
        this.say("NO SOURCE");
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

Creep.prototype.haulEnergy = function(taskWhenFinished) {
    let droppedEnergy = this.room.find(FIND_DROPPED_RESOURCES, {
        filter: function(drop) {return drop.amount > MINIMUM_HAUL_RESOURCE_AMOUNT;}
    });

    if (droppedEnergy.length === 0) {
        this.say("No drops");
        this.setTask(taskWhenFinished);
        return;
    }

    _.sortByOrder(droppedEnergy, drop => drop.amount, 'desc');
    let target = droppedEnergy[0];

    switch (this.pickup(target)) {
        case OK:
            if (_.sum(this.carry) === this.carryCapacity) {
                this.setTask(taskWhenFinished);
            }
            break;
        case ERR_NOT_IN_RANGE:
            this.moveTo(target);
            break;
        case ERR_FULL:
            this.setTask(taskWhenFinished);
            break;
        default:
            console.log("Picking up Energy resulted in unhandled error: " + this.pickup(target));
            break;
    }
};

Creep.prototype.collectEnergy = function(taskWhenFinished) {
    if (!this.room.memory.allowEnergyCollection) {
        this.say("Forbidden");
        return;
    }

    const storage = this.findClosestFilledEnergyStorage(this);

    if (storage === undefined) {
        this.say("No Energy");
        return;
    }

    switch (this.withdraw(storage, RESOURCE_ENERGY)) {
        case OK:
            this.say("nom");
            if (_.sum(this.carry) === this.carryCapacity) {
                this.setTask(taskWhenFinished);
            }
            break;
        case ERR_NOT_IN_RANGE:
            this.moveTo(storage);
            break;
        case ERR_FULL:
            this.setTask(taskWhenFinished);
            break;
        default:
            console.log("Collecting Energy resulted in unhandled error: " + this.withdraw(storage, RESOURCE_ENERGY));
            break;
    }
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
        this.say('No Build');
        this.setTask(taskIfNothingToBuild);
        this.repairStructures();
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
        this.say('No Repair');
        this.setTask(taskIfNothingToRepair);
        this.upgradeRoomController();
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
        this.say('No Storage');
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
            console.log("unexpected error when transferring energy: " + this.transfer(structureThatRequiresEnergy, RESOURCE_ENERGY));
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

/*
Creep.prototype.moveToTargetRoom = function(nextTask) {
    source = this._getRemoteSource();
};
*/