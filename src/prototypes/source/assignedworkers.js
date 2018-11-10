const assignedWorkersCache = {};

Object.defineProperty(Source.prototype, 'assignedWorkers', {
    configurable: true,
    enumerable: false,

    get: function() {
        if (assignedWorkersCache[this.id]) {
            return assignedWorkersCache[this.id];
        } else {
            return assignedWorkersCache[this.id] = countAssignedWorkers(this);
        }
    },

    set: function(value) {
        assignedWorkersCache[this.id] = value;
    }
});

const countAssignedWorkers = function(source) {
    return source.room.find(FIND_MY_CREEPS, {filter: c => c.taskTargetId === source.id}).length;
};

global.utility.reduceSourceWorkerAssignedCount = function(sourceId) {
    if (assignedWorkersCache[sourceId]) {
        assignedWorkersCache[sourceId]--;
    }
};

global.utility.resetAssignedWorkersCache = function(room) {
    log.warning("Reset assignedWorkersCache called in " + room);

    for (const source of room.sources) {
        assignedWorkersCache[source.id] = countAssignedWorkers(source);
    }
};