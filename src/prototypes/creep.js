Creep.prototype.setTask = function(task) {
    this.memory.taskTargetId = undefined;
    this.memory.task = task;
};

Creep.prototype.resetCurrentTask = function() {
    this.memory.taskTargetId = undefined;
};

Creep.prototype.isRenewNeeded = function() {
    if (this.memory.shouldRespawn && this.ticksToLive < CRITICAL_TICKS_TO_LIVE_VALUE) {
        if (this.memory.tier >= Math.floor(this.room.energyCapacityAvailable / COST_PER_WORKER_TIER)) {
            return true;
        }
    } else {
        return false;
    }
};