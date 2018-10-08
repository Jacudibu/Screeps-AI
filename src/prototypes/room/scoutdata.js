const currentScoutVersionNumber = 3;
Room.prototype.updateScoutData = function() {
    delete this.memory.isAlreadyScouted;

    const oldScoutData = this.memory.scoutData;
    let newScoutData;

    if (!oldScoutData || !oldScoutData.v || oldScoutData.v !== currentScoutVersionNumber) {
        initializePermanentRoomData(this);
    }

    if (this.controller) {
        if (this.controller.owner) {
            newScoutData = setupDataForOwnedRoom(this);
        } else if (this.controller.reservation) {
            newScoutData = setupDataForReservedRoom(this);
        } else {
            newScoutData = setupDataForUnownedRoom(this);
        }
    } else {
        newScoutData = {};
    }

    newScoutData.v = currentScoutVersionNumber;

    this.memory.lastScouted = Game.time;
    this.memory.scoutData = newScoutData;
    handleDataChanges(this, oldScoutData, newScoutData);
    log.info("Scouted " + this + ": " + JSON.stringify(newScoutData, null, 2));
};

initializePermanentRoomData = function(room) {
    if (room.find(FIND_SOURCES).length > 0) {
        room.memory.sourceCount = room.find(FIND_SOURCES).length;
    }

    if (room.find(FIND_MINERALS).length > 0) {
        room.memory.mineralType = room.find(FIND_MINERALS)[0].mineralType;
    }
};

setupDataForOwnedRoom = function(room) {
    const scoutData = {};
    scoutData.owner = room.controller.owner.username;
    scoutData.rcl = room.controller.level;

    if (room.controller.safeMode) {
        scoutData.safeMode = room.controller.safeMode;
    }

    if (room.controller.safeModeCooldown) {
        scoutData.safeModeCooldown = room.controller.safeModeCooldown;
    }

    return scoutData;
};

setupDataForReservedRoom = function(room) {
    const scoutData = {};

    scoutData.reserver = room.controller.reservation.username;

    return scoutData;
};

setupDataForUnownedRoom = function(room) {
    const scoutData = {};

    if (room.find(FIND_STRUCTURES).filter(structure => scoutData.structureType === STRUCTURE_ROAD || structure.structureType === STRUCTURE_CONTAINER).length > 0) {
        scoutData.seemsToBeUsed = true;
    }

    scoutData.claimable = true;

    return scoutData;
};

handleDataChanges = function(room, oldData, newData) {
    if (oldData && oldData.owner) {
        if (newData.owner) {
            if (oldData.owner === newData.owner) {
                // Nothing Changed
            } else {
                // owned Room changed its owner
                PlayerMemory.removeOwnedRoomFromPlayer(room, oldData.owner);
                PlayerMemory.addOwnedRoomToPlayer(room, newData.owner);
            }
        } else {
            // owned Room lost its owner
            PlayerMemory.removeOwnedRoomFromPlayer(room, oldData.owner);
        }
    } else if (newData.owner) {
        // empty Room got claimed
        PlayerMemory.addOwnedRoomToPlayer(room, newData.owner);
    }

    if (oldData && oldData.reserver) {
        if (newData.reserver) {
            if (oldData.reserver === newData.reserver) {
                // Nothing Changed
            } else {
                // reserved Room changed its reservation owner
                PlayerMemory.removeReservedRoomFromPlayer(room, oldData.reserver);
                PlayerMemory.addReservedRoomToPlayer(room, newData.reserver);
            }
        } else {
            // reserved Room lost its reservation
            PlayerMemory.removeReservedRoomFromPlayer(room, oldData.reserver);
        }
    } else if (newData.reserver) {
        // empty Room got reserved
        PlayerMemory.addReservedRoomToPlayer(room, newData.reserver);
    }
};