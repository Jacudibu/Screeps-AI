const currentScoutVersionNumber = 4;

const ScoutData = {
    initializePermanentRoomData(room) {
        if (room.find(FIND_SOURCES).length > 0) {
            room.memory.sourceCount = room.find(FIND_SOURCES).length;
        }

        if (room.find(FIND_MINERALS).length > 0) {
            room.memory.mineralType = room.find(FIND_MINERALS)[0].mineralType;
        }

        this.searchForPortals(room);
    },

    searchForPortals(room) {
        const permanentPortals = room.find(FIND_STRUCTURES, {
            filter:
                structure => structure.structureType === STRUCTURE_PORTAL
                    && structure.ticksToDecay === undefined
        });

        if (permanentPortals.length > 0) {
            const destinations = [];
            for (const portal of permanentPortals) {
                if (!destinations.includes(portal.destination.roomName)) {
                    destinations.push(portal.destination.roomName);
                }
            }

            Portals.addPermanentPortals(room.name, destinations);
        }
    },

    setupDataForOwnedRoom(room) {
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
    },

    setupDataForReservedRoom(room) {
        const scoutData = {};

        scoutData.reserver = room.controller.reservation.username;

        return scoutData;
    },

    setupDataForUnownedRoom(room) {
        const scoutData = {};

        if (room.find(FIND_STRUCTURES).filter(structure => scoutData.structureType === STRUCTURE_ROAD || structure.structureType === STRUCTURE_CONTAINER).length > 0) {
            scoutData.seemsToBeUsed = true;
        }

        scoutData.claimable = true;

        return scoutData;
    },

    handleDataChanges(room, oldData, newData) {
        if (oldData && oldData.owner) {
            if (newData.owner) {
                if (oldData.owner === newData.owner) {
                    // Nothing Changed
                } else {
                    // owned Room changed its owner
                    Players.removeOwnedRoomFromPlayer(room, oldData.owner);
                    Players.addOwnedRoomToPlayer(room, newData.owner);
                }
            } else {
                // owned Room lost its owner
                Players.removeOwnedRoomFromPlayer(room, oldData.owner);
            }
        } else if (newData.owner) {
            // empty Room got claimed
            Players.addOwnedRoomToPlayer(room, newData.owner);
        }

        if (oldData && oldData.reserver) {
            if (newData.reserver) {
                if (oldData.reserver === newData.reserver) {
                    // Nothing Changed
                } else {
                    // reserved Room changed its reservation owner
                    Players.removeReservedRoomFromPlayer(room, oldData.reserver);
                    Players.addReservedRoomToPlayer(room, newData.reserver);
                }
            } else {
                // reserved Room lost its reservation
                Players.removeReservedRoomFromPlayer(room, oldData.reserver);
            }
        } else if (newData.reserver) {
            // empty Room got reserved
            Players.addReservedRoomToPlayer(room, newData.reserver);
        }
    },
};

Room.prototype.updateScoutData = function() {
    delete this.memory.isAlreadyScouted;

    const oldScoutData = this.memory.scoutData;
    let newScoutData;

    if (!oldScoutData || !oldScoutData.v || oldScoutData.v !== currentScoutVersionNumber) {
        ScoutData.initializePermanentRoomData(this);
    }

    if (this.controller) {
        if (this.controller.owner) {
            newScoutData = ScoutData.setupDataForOwnedRoom(this);
        } else if (this.controller.reservation) {
            newScoutData = ScoutData.setupDataForReservedRoom(this);
        } else {
            newScoutData = ScoutData.setupDataForUnownedRoom(this);
        }
    } else {
        newScoutData = {};
    }

    newScoutData.v = currentScoutVersionNumber;

    this.memory.lastScouted = Game.time;
    this.memory.scoutData = newScoutData;
    ScoutData.handleDataChanges(this, oldScoutData, newScoutData);
};