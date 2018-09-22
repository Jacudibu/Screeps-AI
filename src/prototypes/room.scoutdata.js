const currentScoutVersionNumber = 1;
Room.prototype.updateScoutData = function() {
    delete this.memory.isAlreadyScouted;

    const scoutData = {};

    if (!this.room.memory.scoutData || !this.memory.scoutData.v || this.memory.scoutData.v !== currentScoutVersionNumber) {
        scoutData.v = currentScoutVersionNumber;
        if (this.find(FIND_SOURCES).length > 0) {
            this.memory.sourceCount = this.find(FIND_SOURCES).length;
        }

        if (this.find(FIND_MINERALS).length > 0) {
            this.memory.mineralType = this.find(FIND_MINERALS)[0].mineralType;
        }
    }

    if (this.room.controller) {
        if (this.room.controller.owner) {
            scoutData.owner = this.controller.owner.username;
            scoutData.rcl = this.controller.level;
            if (this.room.controller.safeMode) {
                scoutData.safeMode = this.room.controller.safeMode;
            }
            if (this.room.controller.safeModeCooldown) {
                scoutData.safeModeCooldown = this.room.controller.safeModeCooldown;
            }
        } else if (this.room.controller.reservation) {
            scoutData.reserver = this.controller.reservation.username;
        } else {
            if (this.find(FIND_STRUCTURES).filter(structure =>
                structure.structureType === STRUCTURE_ROAD || structure.structureType === STRUCTURE_CONTAINER)) {
                scoutData.seemsToBeUsed = true;
            }

            scoutData.claimable = true;
        }
    }

    this.memory.lastScouted = Game.time;
    this.memory.scoutData = scoutData;
};