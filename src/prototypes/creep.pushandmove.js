Creep.prototype.moveAndPush = function(direction) {
    moveCache.creepMoves[this.name] = direction;
};

moveCache = {
    creepMoves: {},

    moveAllCreeps() {
        let totalCPU = 0;
        let calls = 0;
        let pushes = 0;

        for (const creepName in this.creepMoves) {
            calls++;
            const cpuStartAtStart = Game.cpu.getUsed();
            const creep = Game.creeps[creepName];
            const direction = this.creepMoves[creepName];

            if (!creep || !direction) {
                continue;
            }
            if (this.pushThingsAway(creep, direction)) {
                pushes++;
            }

            totalCPU += Game.cpu.getUsed() - cpuStartAtStart;
            creep.move(direction);
        }

        totalCPU = totalCPU - (pushes * 0.2);
        console.log("Creep.moveAndPush Overhead: " + totalCPU + " | calls: " + calls + " | avg: " + (totalCPU / calls));
        this.creepMoves = {};
    },

    getCreepTargetPosition(creep, direction) {
        switch(direction) {
            case TOP:
                return {x: creep.pos.x,     y: creep.pos.y - 1};
            case TOP_RIGHT:
                return {x: creep.pos.x + 1, y: creep.pos.y - 1};
            case RIGHT:
                return {x: creep.pos.x + 1, y: creep.pos.y};
            case BOTTOM_RIGHT:
                return {x: creep.pos.x + 1, y: creep.pos.y + 1};
            case BOTTOM:
                return {x: creep.pos.x,     y: creep.pos.y + 1};
            case BOTTOM_LEFT:
                return {x: creep.pos.x - 1, y: creep.pos.y + 1};
            case LEFT:
                return {x: creep.pos.x - 1, y: creep.pos.y};
            case TOP_LEFT:
                return {x: creep.pos.x - 1, y: creep.pos.y - 1};
        }
    },

    pushThingsAway(creep, direction) {
        const position = this.getCreepTargetPosition(creep, direction);

        if (position.x < 0 || position.x > 49 || position.y < 0 || position.y > 49) {
            return;
        }

        const foundCreeps = creep.room.lookForAt(LOOK_CREEPS, position.x, position.y);
        if (foundCreeps.length === 0) {
            return;
        }

        const otherCreep = foundCreeps[0];

        if (this.creepMoves[otherCreep.name]) {
            return;
        }

        if (!otherCreep.my) {
            return;
        }

        if (otherCreep.fatigue > 0) {
            return;
        }

        //const terrain =creep.room.getTerrain();
        const possibleDirections = [];
        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                if (x === 0 && y === 0) {
                    continue;
                }

                //if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
                if (Game.map.getTerrainAt(position.x + x, position.y + y, creep.room.name) === "wall") {
                    continue;
                }

                possibleDirections.push(this.convertRelativePositionToDirection(x, y));
            }
        }

        otherCreep.move(_.random(0, possibleDirections.length -1));
    },

    convertRelativePositionToDirection(x, y) {
        const xy = (x * 10) + y;

        // 10 * x + y     x
        //          -1 |  0 |  1
        //       -------------------
        //    -1 | -11 | -1 |  9
        // y   0 | -10 |  0 | 10
        //     1 |  -9 |  1 | 11

        switch(xy) {
            case -11:
                return TOP_LEFT;
            case -10:
                return LEFT;
            case -9:
                return BOTTOM_LEFT;
            case -1:
                return TOP;
            case 1:
                return BOTTOM;
            case 9:
                return TOP_RIGHT;
            case 10:
                return RIGHT;
            case 11:
                return BOTTOM_RIGHT;
        }
    }
};

global.moveCache = moveCache;