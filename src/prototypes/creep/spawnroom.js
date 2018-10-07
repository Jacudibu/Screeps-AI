const spawnRooms = {};
Object.defineProperty(Creep.prototype, "spawnRoom", {
    get: function() {
        if (spawnRooms[this.name]) {
            return spawnRooms[this.name];
        }

        if (this.memory.spawnRoom) {
            spawnRooms[this.name] = this.memory.spawnRoom;
            return spawnRooms[this.name];
        }

        return spawnRooms[this.name] = null;
    },

    set: function(value) {
        spawnRooms[this.name] = value;

        if (value) {
            this.memory.spawnRoom = value;
        } else {
            delete this.memory.spawnRoom;
        }
    },
    configurable: false,
    enumerable: false,
});

utility.deleteSpawnRoomEntryOnDeath = function(creepName) {
    delete spawnRooms[creepName];
};