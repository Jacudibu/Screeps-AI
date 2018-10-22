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
    this.sortRemotesByRelevance();

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

const A_GOES_FIRST = -1;
const B_GOES_FIRST = 1;
const A_B_ARE_SAME = 0;
Room.prototype.sortRemotesByRelevance = function() {
    this.remotes.sort((remoteNameA, remoteNameB) => {
            const distA = Game.map.findRoute(this.name, remoteNameA);
            const distB = Game.map.findRoute(this.name, remoteNameB);
            if (distA < distB) {
                return A_GOES_FIRST;
            }

            if (distA > distB) {
                return B_GOES_FIRST;
            }

            const sourceCountA = Object.keys(Memory.rooms[remoteNameA].sources).length;
            const sourceCountB = Object.keys(Memory.rooms[remoteNameB].sources).length;
            if (sourceCountA > sourceCountB) {
                return A_GOES_FIRST;
            }

            if (sourceCountA < sourceCountB) {
                return B_GOES_FIRST;
            }

            /* TODO: Better solution once scouting and source memory revamp go life.
            if (Memory.rooms[remoteNameA].sourceCount > Memory.rooms[remoteNameB].sourceCount) {
                return A_GOES_FIRST;
            }

            if (Memory.rooms[remoteNameA].sourceCount < Memory.rooms[remoteNameB].sourceCount) {
                return B_GOES_FIRST;
            }
            */

            return A_B_ARE_SAME;
        }
    );
};
