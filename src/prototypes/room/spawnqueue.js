Room.prototype.isSpawnQueueEmpty = function() {
    return this.memory.spawnQueue === undefined || this.memory.spawnQueue.length === 0;
};

Room.prototype.addToSpawnQueueEnd = function(args) {
    if (this.memory.spawnQueue === undefined) {
        this.memory.spawnQueue = [];
    }

    this.memory.spawnQueue.push(args);
};

Room.prototype.addToSpawnQueueStart = function(args) {
    if (this.memory.spawnQueue === undefined) {
        this.memory.spawnQueue = [];
    }

    this.memory.spawnQueue.unshift(args);
};