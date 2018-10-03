const remotes = {};
Object.defineProperty(Room.prototype, "remotes", {
    get: function() {
        if (remotes[this.name]) {
            return remotes[this.name];
        }

        if (this.memory.remoteMiningRooms) {
            remotes[this.name] = this.memory.remoteMiningRooms;
            return remotes[this.name];
        }

        return undefined;
    },

    set: function() {},
    configurable: false,
    enumerable: false,
});

Room.prototype.addRemote = function (roomName) {
    if (roomName === this.name) {
        log.warning(this + "Unable to add remote, roomName === Room.name");
        return;
    }

    if (!this.remotes) {
        remotes[this.name] = [];
    }

    if (this.remotes.includes(roomName)) {
        log.warning(this + " " + roomName + " was already added as a remote.");
        return;
    }

    this.remotes.push(roomName);

    this.memory.remoteMiningRooms = this.remotes;

    initializeRemoteMemory(roomName);

    this.updateRepairRoute();
};

Room.prototype.removeRemote = function(roomName) {
    if (!this.remotes) {
        log.warning(this + " no remotes set up, so why would you want to remove a remote?");
        return;
    }

    _.remove(this.remotes, name => name === roomName);

    this.memory.remoteMiningRooms = this.remotes;

    this.updateRepairRoute();
};

initializeRemoteMemory = function(roomName) {
    if (Memory.rooms[roomName] === undefined) {
        Memory.rooms[roomName] = {};
    }

    if (Memory.rooms[roomName].assignedHarvesters === undefined) {
        Memory.rooms[roomName].assignedHarvesters = 0;
        Memory.rooms[roomName].assignedHaulers = 0;
        Memory.rooms[roomName].requiredHaulers = 0;
    }
};
