const rampartGenerator = {
    generateAndGetRamparts(room, layout, forceRegeneration = false) {
        if (room.memory.layout.ramparts && !forceRegeneration) {
            return room.memory.layout.ramparts;
        }

        this.calculateRampartPositions(room, layout);

        return roads;
    },

    calculateRampartPositions(room, layout) {
        const CPU_START = Game.cpu.getUsed();
        const widthHalf = Math.floor(layout.width * 0.5);
        const heightHalf = Math.floor(layout.height * 0.5);
        const center = room._getCenterPosition();

        // const possibleBaseRampartPositions = this.generateBox(room, center, widthHalf, heightHalf);
        const possibleControllerRampartPositions = this.generateBox(room, room.controller.pos, 1, 1);

        const outerBox  = this.generateBox(room, center, widthHalf + 1, heightHalf + 1);
        const centerBox = this.generateBox(room, center, widthHalf, heightHalf);
        const innerBox  = this.generateBox(room, center, widthHalf - 1, heightHalf - 1);

        const outerFlood  = this.filterReachablePositionsViaFloodFill(room, outerBox);
        const centerFlood = this.filterReachablePositionsViaFloodFill(room, centerBox);
        const innerFlood  = this.filterReachablePositionsViaFloodFill(room, innerBox);

        const ramparts = {};
        ramparts.outer  = outerFlood;
        ramparts.center = centerFlood;
        ramparts.inner  = innerFlood;

        ramparts.controller = this.filterReachablePositionsViaFloodFill(room, possibleControllerRampartPositions, ramparts.outer);

        room.memory.layout.ramparts = ramparts;

        console.log(room + " ramparts calculated! Used CPU: " + (Game.cpu.getUsed() - CPU_START));
        return ramparts;
    },

    generateBox(room, centerPosition, widthHalf, heightHalf) {
        let terrain = room.getTerrain();
        let result = [];

        let y;
        let x;

        // top
        y = -heightHalf;
        for (x = -widthHalf; x < widthHalf; x++) {
            this.checkIfPositionIsValidAndAddToArray(result, centerPosition, terrain, x, y);
        }

        // bottom
        y = heightHalf - 1;
        for (x = -widthHalf; x < widthHalf; x++) {
            this.checkIfPositionIsValidAndAddToArray(result, centerPosition, terrain, x, y);
        }

        // left
        x = -widthHalf;
        for (y = -heightHalf; y < heightHalf; y++) {
            this.checkIfPositionIsValidAndAddToArray(result, centerPosition, terrain, x, y);
        }

        // right
        x = widthHalf - 1;
        for (y = -heightHalf; y < heightHalf; y++) {
            this.checkIfPositionIsValidAndAddToArray(result, centerPosition, terrain, x, y);
        }
        return result;
    },

    checkIfPositionIsValidAndAddToArray(array, centerPosition, terrain, x, y) {
        const pos = {x: centerPosition.x + x, y: centerPosition.y + y};
        if (pos.x <= 1 || pos.x >= 48 || pos.y <= 1 || pos.y >= 48) {
            return;
        }

        if (terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) {
            return;
        }

        array.push(pos);
    },

    filterReachablePositionsViaFloodFill(room, positionsToBeFiltered, additionalBlockers = []) {
        const terrain = room.getTerrain();

        let visitedPositions = [];
        let todo = [];
        todo.push(...room.find(FIND_EXIT));

        let result = [];

        while (todo.length > 0) {
            const current = todo.pop();

            // check surroundings
            for (let x = -1; x < 2; x++) {
                for (let y = -1; y < 2; y++) {
                    if (x === y) {
                        continue;
                    }

                    let pos = {x: current.x + x, y: current.y + y};
                    if (pos.x <= 0 || pos.x >= 49 || pos.y <= 0 || pos.y >= 49) {
                        continue;
                    }

                    if (terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) {
                        continue;
                    }

                    if (visitedPositions.find(checkedPos => checkedPos.x === pos.x && checkedPos.y === pos.y)) {
                        continue;
                    }

                    if (todo.find(checkedPos => checkedPos.x === pos.x && checkedPos.y === pos.y)) {
                        continue;
                    }

                    if (positionsToBeFiltered.find(checkedPos => checkedPos.x === pos.x && checkedPos.y === pos.y)) {
                        result.push(pos);
                        visitedPositions.push(pos);
                        continue;
                    }

                    if (additionalBlockers.find(checkedPos => checkedPos.x === pos.x && checkedPos.y === pos.y)) {
                        visitedPositions.push(pos);
                        continue;
                    }

                    todo.push(pos);
                }
            }

            visitedPositions.push(current);
        }

        return result;
    },

};

profiler.registerObject(rampartGenerator, "rampartGenerator");
module.exports = rampartGenerator;