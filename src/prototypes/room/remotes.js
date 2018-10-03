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

    initializeRemoteMemory(this.name, roomName);

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

initializeRemoteMemory = function(roomName, remoteRoomName) {
    if (Memory.rooms[remoteRoomName] === undefined) {
        Memory.rooms[remoteRoomName] = {};
    }

    if (Memory.rooms[remoteRoomName].assignedHarvesters === undefined) {
        Memory.rooms[remoteRoomName].assignedHarvesters = 0;
        Memory.rooms[remoteRoomName].assignedHaulers = 0;

        // TODO: remove this if once scouts are running around on the live server
        if (Memory.rooms[remoteRoomName].sourceCount) {
            Memory.rooms[remoteRoomName].requiredHaulers = calculateNormalDistanceBetweenRooms(roomName, remoteRoomName) * Memory.rooms[remoteRoomName].sourceCount;
        } else {
            Memory.rooms[remoteRoomName].requiredHaulers = 0;
        }

    }
};

calculateNormalDistanceBetweenRooms = function(roomA, roomB) {
    const route = Game.map.findRoute(roomA, roomB);
    if (route === ERR_NO_PATH) {
        return Infinity;
    }

    return route.length;
};
