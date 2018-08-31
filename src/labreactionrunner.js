let nextLabTick = {};
const IDLE_TIME_IF_WAITING_FOR_RESOURCES = 50;
const IDLE_TIME_IF_NO_MATCH = 1000;
const IDLE_TIME_ON_GLOBAL_RESET = 20;
const IDLE_TIME_IF_NO_DEMAND = 250;

const labReactionRunner = {
    run: function() {
        for (let roomName in Game.rooms) {
            const room = Game.rooms[roomName];

            if (room.myLabs < 3 || room.outputLabs === 0) {
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
                             lab.requestedMineral != null ? lab.requestedMineral : "-", lab.pos, {color: "orange", font: 0.2});

        }

        room.visual.text("next labTick: " + nextLabTick[room.name], 0, 0, {align: 'left'});
        room.visual.text("current labtask: " + Memory.rooms[room.name].labtask, 0, 1, {align: 'left'});
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

        // Is mineral still in store?
        for (let lab of room.inputLabs) {
            if (lab.requestedMineral == null || (!room.terminal.store[lab.requestedMineral] && !room.storage.store[lab.requestedMineral])) {
                keepCurrentReaction = false;
                break;
            }
        }

        // Is product still in demand?
        if (Object.keys(resourceDemand).length === 0) {
            nextLabTick[room.name] = Game.time + IDLE_TIME_ON_GLOBAL_RESET;
            return;
        }

        if (resourceDemand[room.name] === undefined) {
            nextLabTick[room.name] = Game.time + IDLE_TIME_IF_NO_DEMAND;
            room.memory.labtask = LABTASK.MAKE_EMPTY;
            room.inputLabs[0].requestedMineral = null;
            room.inputLabs[1].requestedMineral = null;
            return;
        }

        if (room.inputLabs[0].requestedMineral == null || room.inputLabs[1].requestedMineral == null) {
            keepCurrentReaction = false;
        } else {
            let product = REACTIONS[room.inputLabs[0].requestedMineral][room.inputLabs[1].requestedMineral];
            if (!product) { // some garbage loaded
                keepCurrentReaction = false;
            } else if (resourceDemand[room.name].filter(demand => demand.resourceType === product).length === 0) {
                keepCurrentReaction = false;
            }
        }

        console.log("keep current reaction -> " + keepCurrentReaction);
        if (keepCurrentReaction) {
            room.memory.labtask = LABTASK.RUN_REACTION;
            nextLabTick[room.name] = Game.time + IDLE_TIME_IF_WAITING_FOR_RESOURCES;
        } else {
            if (this.areLabsEmpty(room)) {
                console.log("labs marked as empty");
                this.determineReactionMaterials(room);
            } else {
                console.log("labs marked as full, make them empty");
                room.memory.labtask = LABTASK.MAKE_EMPTY;
                room.inputLabs[0].requestedMineral = null;
                room.inputLabs[1].requestedMineral = null;
            }
        }
    },

    determineReactionMaterials: function(room) {
        const demandWithoutBaseMinerals = resourceDemand[room.name].filter(demand => !BASE_MINERALS.includes(demand.resourceType));

        // TODO: this can probable be made a whole lot nicer by adding our own global format for reactions which uses products as KEYS
        const reactionKeys = Object.keys(REACTIONS);
        for (let demand of demandWithoutBaseMinerals) {
            for (let i = 0; i < reactionKeys.length; i++) {
                const subKeys = Object.keys(REACTIONS[reactionKeys[i]]);
                for (let j = 0; j < subKeys.length; j++) {
                    let currentReaction = REACTIONS[reactionKeys[i]][subKeys[j]];
                    if (demand.resourceType !== currentReaction) {
                        continue;
                    }

                    if (!room.storage.store[reactionKeys[i]] && !room.terminal.store[reactionKeys[i]]) {
                        continue;
                    }

                    if (!room.storage.store[subKeys[j]] && !room.terminal.store[subKeys[j]]) {
                        continue;
                    }

                    // ITS POSSIBLE!
                    room.inputLabs[0].requestedMineral = reactionKeys[i];
                    room.inputLabs[1].requestedMineral = subKeys[j];
                    room.memory.labtask = LABTASK.RUN_REACTION;
                    nextLabTick[room.name] = Game.time + IDLE_TIME_IF_WAITING_FOR_RESOURCES;
                    return;
                }
            }
        }

        // No possible productions found, check back later... WAY LATER.
        nextLabTick[room.name] = Game.time + IDLE_TIME_IF_NO_MATCH;
    },

    makeEmpty: function(room) {
        if (this.areLabsEmpty(room)) {
            room.memory.labtask = LABTASK.DECIDE_WHAT_TO_DO
        } else {
            nextLabTick[room.name] = Game.time + IDLE_TIME_IF_WAITING_FOR_RESOURCES;
        }
    },

    areLabsEmpty: function(room) {
        for (let lab of room.myLabs) {
            if (lab.mineralAmount > 0) {
                return false;
            }
        }

        return true;
    },

};

profiler.registerObject(labReactionRunner, "LabReactionRunner");
module.exports = labReactionRunner;
