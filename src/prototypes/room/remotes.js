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

initializeRemoteMemory = function(baseRoomName, remoteRoomName) {
    if (Memory.rooms[remoteRoomName] === undefined) {
        Memory.rooms[remoteRoomName] = {};
    }

    if (Memory.rooms[remoteRoomName].assignedHarvesters === undefined) {
        Memory.rooms[remoteRoomName].assignedHarvesters = 0;
        Memory.rooms[remoteRoomName].assignedHaulers = 0;
    }
};

Room.prototype.calculateRequiredHaulersForRemote = function(remoteRoomName) {
    const remoteRoom = Game.rooms[remoteRoomName];

    const baseRoomCenterPosition = this._getCenterPosition();
    if (!baseRoomCenterPosition) {
        log.error(this + " No base center position defined, can't calculate required haulers for room " + remoteRoomName);
        remoteRoom.memory.requiredHaulers = 0;
        return;
    }

    let totalSourceDistance = 0;
    for (const source of remoteRoom.sources) {
        totalSourceDistance += PathFinder.search(source.pos, baseRoomCenterPosition).path.length;
    }

    const haulerMaxCarryCapacity = 1650;

    const roundDistance = totalSourceDistance * 2;

    const SOURCE_REFRESH_INTERVAL = 300;
    const sourceEnergyPerTick = SOURCE_ENERGY_CAPACITY / SOURCE_REFRESH_INTERVAL;

    const requiredHaulers = roundDistance / (haulerMaxCarryCapacity / sourceEnergyPerTick);

    remoteRoom.memory.requiredHaulers = Math.ceil(requiredHaulers);
};

const A_GOES_FIRST = -1;
const B_GOES_FIRST = 1;
const A_B_ARE_SAME = 0;
Room.prototype.sortRemotesByRelevance = function() {
    this.remotes.sort((remoteNameA, remoteNameB) => {
            const distA = calculateRouteLengthBetweenRooms(this.name, remoteNameA);
            const distB = calculateRouteLengthBetweenRooms(this.name, remoteNameB);
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

calculateRouteLengthBetweenRooms = function(roomA, roomB) {
    const route = Game.map.findRoute(roomA, roomB);
    if (route === ERR_NO_PATH) {
        return Infinity;
    }

    return route.length;
};
