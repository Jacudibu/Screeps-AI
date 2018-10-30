Creep.prototype.setTask = function(task, keepTaskTargetId) {
    if (!keepTaskTargetId) {
        this.taskTargetId = undefined;
    }

    this.task = task;
};

Creep.prototype.resetCurrentTask = function() {
    this.taskTargetId = undefined;
};

Creep.prototype.countBodyPartsOfTypeAndApplyBoostWeighting = function(searchedPart) {
    return this.body.reduce((total, currentPart) => {
            if (currentPart.type === searchedPart) {
                if (currentPart.boost) {
                    return total + 1 + boostTiers[currentPart.boost];
                }

                return total + 1;
            }

            return total;
        }, 0);
};

Creep.prototype.logActionError = function(action, errorCode) {
    log.warning(this + " " + action + " resulted in unhandled error code " + errorCode)
};

// ~~~~~~~~~~~~~~~~~~
// ~~ Small Helpers ~~
// ~~~~~~~~~~~~~~~~~~

Creep.prototype._withdrawEnergy = function(storage, taskWhenFinished) {
    this.say(creepTalk.withdrawEnergy, true);
    const result = this.withdraw(storage, RESOURCE_ENERGY);
    switch (result) {
        case OK:
            if (_.sum(this.carry) === this.carryCapacity) {
                this.setTask(taskWhenFinished);
            }
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(storage, {maxRooms: 1});
            break;
        case ERR_FULL:
            this.setTask(taskWhenFinished);
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            this.taskTargetId = undefined;
            break;
        default:
            this.logActionError("Collecting Energy", result);
            break;
    }

    return result;
};

Creep.prototype._withdrawResource = function(storage, taskWhenFinished) {
    this.say(creepTalk.withdrawResource, true);

    switch (this.withdraw(storage, this.hauledResourceType)) {
        case OK:
            if (_.sum(this.carry) === this.carryCapacity) {
                this.setTask(taskWhenFinished);
            }
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(storage, {maxRooms: 1});
            break;
        case ERR_FULL:
            this.setTask(taskWhenFinished);
            break;
        case ERR_NOT_ENOUGH_RESOURCES:
            this.taskTargetId = undefined;
            break;
        default:
            this.logActionError("Withdrawing " + this.hauledResourceType,
                                this.withdraw(storage, this.hauledResourceType));
            break;
    }
};

Creep.prototype._pickupEnergy = function(pickup, taskWhenFinished, onlyPickupThisOne) {
    this.say(creepTalk.pickupResource, true);
    switch (this.pickup(pickup)) {
        case OK:
            if (_.sum(this.carry) === this.carryCapacity || onlyPickupThisOne) {
                this.setTask(taskWhenFinished);
            }
            break;
        case ERR_NOT_IN_RANGE:
            this.travelTo(pickup, {maxRooms: 1});
            break;
        case ERR_FULL:
            this.setTask(taskWhenFinished);
            break;
        case ERR_INVALID_TARGET:
            this.resetCurrentTask();
            break;
        default:
            this.logActionError("Picking up Energy ", this.pickup(pickup));
            break;
    }
};
