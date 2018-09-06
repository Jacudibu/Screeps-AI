let nextLabTick = {};
const IDLE_TIME_IF_WAITING_FOR_HAULERS = 200;
const IDLE_TIME_IF_NO_MATCH = 1000;
const IDLE_TIME_ON_GLOBAL_RESET = 50;
const IDLE_TIME_IF_NO_DEMAND = 250;

const MIN_MINERAL_COUNT_FOR_REACTION = 1500;

global.REACTIONS_INVERTED = {};
for (let mineralA in REACTIONS) {
    for (let mineralB in REACTIONS[mineralA]) {
        let product = REACTIONS[mineralA][mineralB];
        REACTIONS_INVERTED[product] = [mineralA, mineralB];
    }
}

const labReactionRunner = {
    run() {
        for (let roomName in Game.rooms) {
            const room = Game.rooms[roomName];

            if (room.myLabs.length < 3 || room.outputLabs.length === 0) {
                continue;
            }

            if (!nextLabTick[roomName] || nextLabTick[roomName] <= Game.time)
            {
                this.tryRunLabCodeForRoom(room);
            }

            this.drawLabVisuals(room);
        }
    },

    drawLabVisuals(room) {
        for (let lab of room.outputLabs) {
            room.visual.text(lab.mineralType != null ? lab.mineralType : "-", lab.pos, {color: "orange", font: 0.2});
        }

        for (let lab of room.inputLabs) {
            room.visual.text(lab.mineralType != null ? lab.mineralType :
                             lab.requestedMineral != null ? lab.requestedMineral : "-", lab.pos, {color: "orange", font: 0.2});
        }

        room.visual.text("next labTick: " + nextLabTick[room.name], 0, 0, {align: 'left'});
        room.visual.text("current labtask: " + room.labTask + (room.labReaction ? " > " + room.labReaction : ""), 0, 1, {align: 'left'});
    },

    tryRunLabCodeForRoom(room) {
        try {
            this.runLabCodeForRoom(room);
        } catch (e) {
            let message = room.name + "|LabCode -> caught error: " + e;
            if (e.stack) {
                message += "\nTrace:\n" + e.stack;
            }
            log.error(message);
        }
    },

    runLabCodeForRoom(room) {
        switch (room.labTask) {
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
            // TODO: Ship needed minerals to labs if something is in boostQueue

            default:
                room.labTask = LABTASK.DECIDE_WHAT_TO_DO;
                break;
        }
    },

    doLabReactions(room) {
        let result;
        for (let lab of room.outputLabs) {
            result = lab.runReaction(room.inputLabs[0], room.inputLabs[1]);
        }

        if (result === OK || result === ERR_FULL || result === ERR_TIRED) {
            nextLabTick[room.name] = Game.time + REACTION_TIME[room.labReaction];
            return;
        }

        if (room.inputLabs[0].requestedMineral && room.inputLabs[1].requestedMineral) {
            if (   room.inputLabs[0].mineralType === room.inputLabs[0].requestedMineral
                && room.inputLabs[1].mineralType === room.inputLabs[1].requestedMineral) {
                // Lab just went empty.
                room.labTask = LABTASK.DECIDE_WHAT_TO_DO;
                return;
            } else {
                log.warning(room.name + "|Labcode: wrong reactionminerals loaded...");
                room.labTask = LABTASK.MAKE_EMPTY;
                return;
            }
        }

        if (room.labReaction) {
            // Global reset and labs have been empty, bleh.
            // Just set values and wait for good measure.
            room.inputLabs[0].requestedMineral = REACTIONS_INVERTED[room.labReaction][0];
            room.inputLabs[1].requestedMineral = REACTIONS_INVERTED[room.labReaction][1];
            nextLabTick[room.name] = Game.time + IDLE_TIME_ON_GLOBAL_RESET;
            return;
        }

        // Something has gone wrong, I guess.
        log.warning(room.name + "|Reactions have not been set up, but current lab state is runReactions");
        room.labTask = LABTASK.DECIDE_WHAT_TO_DO;
    },

    decideWhatToDo(room) {
        // Check if demand is empty due to global reset
        if (Object.keys(resourceDemand).length === 0) {
            nextLabTick[room.name] = Game.time + IDLE_TIME_ON_GLOBAL_RESET;
            return;
        }

        if (!resourceDemand[room.name]) {
            nextLabTick[room.name] = Game.time + IDLE_TIME_IF_NO_DEMAND;
            room.labTask = LABTASK.MAKE_EMPTY;
            room.labReaction = null;
            room.inputLabs[0].requestedMineral = null;
            room.inputLabs[1].requestedMineral = null;
            return;
        }

        if (this.shouldKeepCurrentReaction(room)) {
            room.labTask = LABTASK.RUN_REACTION;
            nextLabTick[room.name] = Game.time + IDLE_TIME_IF_WAITING_FOR_HAULERS;
            return;
        }

        if (!this.areLabsEmpty(room)) {
            room.labTask = LABTASK.MAKE_EMPTY;
            room.labReaction = null;
            room.inputLabs[0].requestedMineral = null;
            room.inputLabs[1].requestedMineral = null;
            return;
        }

        this.determineReactionMaterials(room);
    },

    shouldKeepCurrentReaction(room) {
        // Is mineral still in store?
        for (let lab of room.inputLabs) {
            if (lab.requestedMineral == null || (!room.terminal.store[lab.requestedMineral] && !room.storage.store[lab.requestedMineral])) {
                return false;
            }
        }

        // Check if current mineral data is valid & reaction is still relevant
        if (room.inputLabs[0].requestedMineral == null || room.inputLabs[1].requestedMineral == null) {
            return false;
        }

        if (!room.labReaction) {
            // some garbage is loaded in our labs
            return false;
        }

        // if still in demand => true
        return resourceDemand[room.name].filter(demand => demand.resourceType === room.labReaction).length !== 0;
    },

    determineReactionMaterials(room) {
        const demandWithoutBaseMinerals = resourceDemand[room.name].filter(demand => !BASE_MINERALS.includes(demand.resourceType));

        for (let demand of demandWithoutBaseMinerals) {
            let mineralA = REACTIONS_INVERTED[demand.resourceType][0];
            if (   (!room.storage.store[mineralA]  || room.storage.store[mineralA]  < MIN_MINERAL_COUNT_FOR_REACTION)
                && (!room.terminal.store[mineralA] || room.terminal.store[mineralA] < MIN_MINERAL_COUNT_FOR_REACTION)) {
                continue;
            }

            let mineralB = REACTIONS_INVERTED[demand.resourceType][1];
            if (   (!room.storage.store[mineralB]  || room.storage.store[mineralB]  < MIN_MINERAL_COUNT_FOR_REACTION)
                && (!room.terminal.store[mineralB] || room.terminal.store[mineralB] < MIN_MINERAL_COUNT_FOR_REACTION)) {
                continue;
            }

            // Found something we can produce!
            room.inputLabs[0].requestedMineral = mineralA;
            room.inputLabs[1].requestedMineral = mineralB;

            room.labTask = LABTASK.RUN_REACTION;
            room.labReaction = demand.resourceType;

            nextLabTick[room.name] = Game.time + IDLE_TIME_IF_WAITING_FOR_HAULERS;
            return;
        }

        // No possible productions found, check back later - WAY LATER.
        nextLabTick[room.name] = Game.time + IDLE_TIME_IF_NO_MATCH;
    },

    makeEmpty(room) {
        if (this.areLabsEmpty(room)) {
            room.labTask = LABTASK.DECIDE_WHAT_TO_DO
        } else {
            nextLabTick[room.name] = Game.time + IDLE_TIME_IF_WAITING_FOR_HAULERS;
        }
    },

    areLabsEmpty(room) {
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
