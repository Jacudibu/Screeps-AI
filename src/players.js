global.Players = {
    addOwnedRoomToPlayer(room, playerName) {
        this._ensurePlayerEntryExists(playerName);
        Memory.players[playerName].ownedRooms.push(room.name);
    },

    removeOwnedRoomFromPlayer(room, playerName) {
        this._ensurePlayerEntryExists(playerName);
        _.remove(Memory.players[playerName].ownedRooms, roomName => roomName === room.name);
    },

    addReservedRoomToPlayer(room, playerName) {
        this._ensurePlayerEntryExists(playerName);
        Memory.players[playerName].reservedRooms.push(room.name);
    },

    removeReservedRoomFromPlayer(room, playerName) {
        this._ensurePlayerEntryExists(playerName);
        _.remove(Memory.players[playerName].reservedRooms, roomName => roomName === room.name);
    },

    _ensurePlayerEntryExists(playerName) {
        if (!Memory.players) {
            Memory.players = {};
        }

        if (!Memory.players[playerName]) {
            Memory.players[playerName] = {
                ownedRooms: [],
                reservedRooms: [],
                LOVE: 0,
            };
        }
    },
};