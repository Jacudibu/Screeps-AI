Creep.prototype.harvestEnergy = function(taskWhenFinished) {
    let source = this._getSource();

    if (source === ERR_NOT_FOUND) {
        this.say("NO SOURCE");
        return;
    }

    switch (this.harvest(source)) {
        case OK:
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

Creep.prototype.collectEnergy = function(taskWhenFinished) {
    if (this.room.energyCapacityAvailable - this.room.energyAvailable >= this.carryCapacity + ENERGY_COLLECTOR_EXTRA_BUFFER) {
        this.say("Buffering");
        return;
    }

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
            this.setTask(taskWhenFinished);
            break;
        case ERR_NOT_IN_RANGE:
            this.moveTo(storage);
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

Creep.prototype.upgradeRoomController = function() {
    switch (this.upgradeController(this.room.controller)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            this.moveTo(this.room.controller);
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            this.setTask(this.isRenewNeeded() ? TASK.RENEW_CREEP : TASK.COLLECT_ENERGY);
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