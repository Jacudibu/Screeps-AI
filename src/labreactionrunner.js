

const labReactionRunner = {
    run: function() {
        for (let roomName in Game.rooms) {
            const room = Game.rooms[roomName];

            if (room.inputLabs.length < 2) {
                continue;
            }

            this.drawLabVisuals(room);

            // TODO: Check if lab code should tick

            this.runLabCodeForRoom(room);
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
            // TODO: Empty labs & ship needed minerals to labs.

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
        } else {
            // TODO: set nextLabTick to Game.time + lab.cooldown
        }
    },

    decideWhatToDo: function(room) {
        let keepCurrentReaction = true;

        for (let lab of room.outputLabs) {
            // TODO: check if required material is in store and if the end product of the reaction is still needed
        }

        if (keepCurrentReaction) {
            room.memory.labtask = LABTASK.RUN_REACTION;
            // TODO: Add some cooldown before checking again
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
            // TODO: Increase nextLabTick by 50-100 ticks
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
