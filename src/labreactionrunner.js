let nextLabTick = {};
const IDLE_TIME_IF_WAITING_FOR_RESOURCES = 50;
const IDLE_TIME_IF_NO_MATCH = 1000;
const IDLE_TIME_ON_GLOBAL_RESET = 20;
const IDLE_TIME_IF_NO_DEMAND = 250;

global.REACTIONS_INVERTED = {};
for (let mineralA in REACTIONS) {
    for (let mineralB in REACTIONS[mineralA]) {
        let product = REACTIONS[mineralA][mineralB];
        REACTIONS_INVERTED[product] = [mineralA, mineralB];
    }
}

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
            // TODO: Ship needed minerals to labs if something is in boostQueue

            default:
                room.memory.labtask = LABTASK.DECIDE_WHAT_TO_DO;
                break;
        }
    },

    doLabReactions: function(room) {
        let result;
        for (let lab of room.outputLabs) {
            result = lab.runReaction(room.inputLabs[0], room.inputLabs[1]);
        }

        if (result !== OK) {
            switch (result) {
                case ERR_NOT_ENOUGH_RESOURCES:
                case ERR_NOT_IN_RANGE:
                    room.memory.labtask = LABTASK.DECIDE_WHAT_TO_DO;
                    return;
                case ERR_INVALID_ARGS:
                    room.memory.labtask = LABTASK.MAKE_EMPTY;
                    return;
            }

            console.log(room.name + "|unhandled lab error: " + result);
        }

        let produce = REACTIONS[room.inputLabs[0].requestedMineral][room.inputLabs[1].requestedMineral];
        nextLabTick[room.name] = Game.time + REACTION_TIME[produce];
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

        // Check if demand is empty due to global reset
        if (Object.keys(resourceDemand).length === 0) {
            nextLabTick[room.name] = Game.time + IDLE_TIME_ON_GLOBAL_RESET;
            return;
        }

        if (!resourceDemand[room.name]) {
            nextLabTick[room.name] = Game.time + IDLE_TIME_IF_NO_DEMAND;
            room.memory.labtask = LABTASK.MAKE_EMPTY;
            room.inputLabs[0].requestedMineral = null;
            room.inputLabs[1].requestedMineral = null;
            return;
        }

        // Check if current mineral data is valid & product is still needed
        if (room.inputLabs[0].requestedMineral == null || room.inputLabs[1].requestedMineral == null) {
            keepCurrentReaction = false;
        } else {
            let product = REACTIONS[room.inputLabs[0].requestedMineral][room.inputLabs[1].requestedMineral];
            if (!product) { // some garbage is loaded in our labs
                keepCurrentReaction = false;
            } else if (resourceDemand[room.name].filter(demand => demand.resourceType === product).length === 0) {
                keepCurrentReaction = false;
            }
        }

        if (keepCurrentReaction) {
            room.memory.labtask = LABTASK.RUN_REACTION;
            nextLabTick[room.name] = Game.time + IDLE_TIME_IF_WAITING_FOR_RESOURCES;
        } else {
            if (this.areLabsEmpty(room)) {
                this.determineReactionMaterials(room);
            } else {
                room.memory.labtask = LABTASK.MAKE_EMPTY;
                room.inputLabs[0].requestedMineral = null;
                room.inputLabs[1].requestedMineral = null;
            }
        }
    },

    determineReactionMaterials: function(room) {
        const demandWithoutBaseMinerals = resourceDemand[room.name].filter(demand => !BASE_MINERALS.includes(demand.resourceType));

        for (let demand of demandWithoutBaseMinerals) {
            let mineralA = REACTIONS_INVERTED[demand.resourceType][0];
            if (!room.storage.store[mineralA] && !room.terminal.store[mineralA]) {
                continue;
            }

            let mineralB = REACTIONS_INVERTED[demand.resourceType][1];
            if (!room.storage.store[mineralB] && !room.terminal.store[mineralB]) {
                continue;
            }

            // Found something we can produce!
            room.inputLabs[0].requestedMineral = mineralA;
            room.inputLabs[1].requestedMineral = mineralB;
            room.memory.labtask = LABTASK.RUN_REACTION;
            nextLabTick[room.name] = Game.time + IDLE_TIME_IF_WAITING_FOR_RESOURCES;
            return;
        }

        // No possible productions found, check back later - WAY LATER.
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
