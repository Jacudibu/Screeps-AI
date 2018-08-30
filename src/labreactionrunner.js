let nextLabTick = {};
const IDLE_TIME_BEFORE_CHECKING_AGAIN = 50;

const labReactionRunner = {
    run: function() {
        for (let roomName in Game.rooms) {
            const room = Game.rooms[roomName];

            if (room.inputLabs.length < 2) {
                continue;
            }

            if (!nextLabTick[roomName] || nextLabTick[roomName] <= Game.time)
            {
                this.runLabCodeForRoom(room);
            }

            this.drawLabVisuals(room);
        }
    },

    drawLabVisuals: function(room) {
        for (let lab of room.outputLabs) {
            room.visual.text(lab.mineralType != null ? lab.mineralType : "-", lab.pos, {color: "yellow", font: 0.2});
        }

        for (let lab of room.inputLabs) {
            room.visual.text(lab.mineralType != null ? lab.mineralType :
                             lab.requestedMineral != null ? lab.requestedMineral : "-", lab.pos, {color: "orange", font: 0.33});

        }
    },

    runLabCodeForRoom: function(room) {
        switch (room.memory.labtask) {
            case LABTASK.RUN_REACTION:
                this.doLabReactions(room);
                break;
            case LABTASK.DECIDE_WHAT_TO_DO:
                this.decideWhatToDo(room);
                break;
            case LABTASK.MAKE_EMPTY:
                this.makeEmpty(room);
                break;
            case LABTASK.BOOST_CREEP:
            // TODO: Ship needed minerals to labs.

            default:
                room.memory.labtask = LABTASK.DECIDE_WHAT_TO_DO;
                break;
        }
    },

    doLabReactions: function(room) {
        for (let lab of room.outputLabs) {
            lab.runReaction(room.inputLabs[0], room.inputLabs[1]);
        }

        if (room.inputLabs[0].mineralAmount === 0 || room.inputLabs[1].mineralAmount === 0) {
            room.memory.labtask = LABTASK.DECIDE_WHAT_TO_DO;
        }

        nextLabTick[room.name] = Game.time + room.outputLabs[0].cooldown;
    },

    decideWhatToDo: function(room) {
        let keepCurrentReaction = true;

        for (let lab of room.outputLabs) {
            if (lab.requestedMineral == null || (room.terminal.store[lab.requestedMineral] <= MINIMUM_HAUL_RESOURCE_AMOUNT
                                              && room.storage.store[lab.requestedMineral] <= MINIMUM_HAUL_RESOURCE_AMOUNT)) {
                keepCurrentReaction = false;
                break;
            }

            // TODO: check if required materials are in store and if the end product of the reaction is still needed
        }

        if (keepCurrentReaction) {
            room.memory.labtask = LABTASK.RUN_REACTION;
            nextLabTick[room.name] = Game.time + IDLE_TIME_BEFORE_CHECKING_AGAIN;
        } else {
            if (this.areLabsEmpty(room)) {
                room.memory.labtask = LABTASK.RUN_REACTION;
            }

            this.determineReactionMaterials(room);
        }
    },

    determineReactionMaterials: function(room) {
        // TODO: Automation
        room.inputLabs[0].requestedMineral = "U";
        room.inputLabs[1].requestedMineral = "H";

        room.memory.labtask = LABTASK.RUN_REACTION;
    },

    makeEmpty: function(room) {
        if (this.areLabsEmpty()) {
            room.memory.labtask = LABTASK.DECIDE_WHAT_TO_DO
        } else {
            nextLabTick[room.name] = Game.time + IDLE_TIME_BEFORE_CHECKING_AGAIN;
        }
    },

    areLabsEmpty: function(room) {
        for (let lab of room.labs) {
            if (lab.mineralAmount > 0) {
                return false;
            }
        }

        return true;
    },

};

module.exports = labReactionRunner;
