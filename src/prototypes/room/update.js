Room.prototype.updateBeforeCreeps = function() {
    this.checkForHostiles();
    this.updateThreat();

    if (this.controller && this.controller.my) {
        this.manageStandbyDefenders();
    }
};

Room.prototype.updateAfterCreeps = function() {
    this.sortHostilesByPriority();

    if (this.controller) {
        if (this.controller.my) {
            this.askForHelpIfThreatDetected();

            if (this.repairAlmostBrokenRamparts() === ERR_NOT_FOUND) {
                this.runDefenseProcedures();
                this.repairDamagedCreeps();
            }

            this.checkForRCLUpdate();
            this.tryPlacingConstructionSites();

            if (this.remotes) {
                for (const remoteName of this.remotes) {
                    const remote = Game.rooms[remoteName];
                    if (remote) {
                        remote.askForHelpIfThreatDetected();
                        remote.tryPlacingRemoteConstructionSites();
                    }
                }
            }
        }
    }
};

let lastRCL = {};
Room.prototype.checkForRCLUpdate = function() {
    if (!this.memory.lastRCL) {
        this.memory.lastRCL = this.controller.level;
        lastRCL[this.name] = this.controller.level;

        if (this.controller.level === 1) {
            log.warning(this + " new room established!");
        }

        this.onRCLUpdate();
        return;
    }

    if (!lastRCL[this.name]) {
        lastRCL[this.name] = this.memory.lastRCL;
        return;
    }

    if (lastRCL[this.name] === this.controller.level) {
        return;
    }

    log.info(this + " RCL UPDATE! " + lastRCL[this.name] + " -> " + this.controller.level);

    lastRCL[this.name] = this.controller.level;
    this.memory.lastRCL = this.controller.level;

    this.onRCLUpdate();
};

Room.prototype.onRCLUpdate = function() {
    this._recalculateRequestedCreeps();
    this._forceConstructionTimerReset();
};

Room.prototype.manageStandbyDefenders = function() {
    const defendersOnStandby = this.find(FIND_MY_CREEPS, {
        filter: c => c.task === TASK.STANDBY && (c.role === ROLE.DEFENDER || c.role === ROLE.RANGED_DEFENDER)
    });

    if (defendersOnStandby.length === 0) {
        return;
    }

    for (let remoteName of this.remotes) {
        if (remoteName.requiresHelp) {
            for (let defender of defendersOnStandby) {
                defender.targetRoomName = remoteName;
                defender.setTask(TASK.MOVE_TO_ROOM);
                log.info(defender + " moved out to save " + remoteName + "!");
            }

            Memory.rooms[remoteName].requiresHelp = false;
            return;
        }
    }
};