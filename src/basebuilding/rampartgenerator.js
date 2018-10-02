const rampartGenerator = {
    generateAndGetRamparts(room, layout, forceRegeneration = false) {
        if (room.memory.layout.ramparts && !forceRegeneration) {
            return room.memory.layout.ramparts;
        }

        this.calculateRampartPositions(room, layout);

        return roads;
    },

    calculateRampartPositions(room, layout) {
        const widthHalf = Math.floor(layout.width * 0.5);
        const heightHalf = Math.floor(layout.height * 0.5);
        const center = room._getCenterPosition();

        const possibleBaseRampartPositions = this.generateBox(room, center, widthHalf, heightHalf);
        const possibleControllerRampartPositions = this.generateBox(room, room.controller.pos, 1, 1);

        // FLOOD FILL!
        const centerRampartLayer = this.filterReachablePositionsViaFloodFill(room, possibleBaseRampartPositions);
        const controllerRamparts = this.filterReachablePositionsViaFloodFill(room, possibleControllerRampartPositions, centerRampartLayer);

        // Expand base ramparts
        const outerRampartLayer = [];
        const innerRampartLayer = [];

        for (let pos of centerRampartLayer) {
            if (pos.x === -widthHalf + center.x) {
                // LEFT
                innerRampartLayer.push({x: pos.x + 1, y: pos.y});
                outerRampartLayer.push({x: pos.x - 1, y: pos.y});
            }

            if (pos.x === widthHalf + center.x - 1) {
                // RIGHT
                innerRampartLayer.push({x: pos.x - 1, y: pos.y});
                outerRampartLayer.push({x: pos.x + 1, y: pos.y});
            }

            if (pos.y === -heightHalf + center.y) {
                // TOP
                innerRampartLayer.push({x: pos.x, y: pos.y + 1});
                outerRampartLayer.push({x: pos.x, y: pos.y - 1});
            }

            if (pos.y === heightHalf + center.y - 1) {
                // BOTTOM
                innerRampartLayer.push({x: pos.x, y: pos.y - 1});
                outerRampartLayer.push({x: pos.x, y: pos.y + 1});
            }
        }

        const ramparts = {};
        ramparts.controller = controllerRamparts;
        ramparts.inner  = innerRampartLayer;
        ramparts.center = centerRampartLayer;
        ramparts.outer  = outerRampartLayer;


        room.memory.layout.ramparts = ramparts;
        return ramparts;
    },

    generateBox(room, centerPosition, widthHalf, heightHalf) {
        let terrain = room.getTerrain();
        let result = [];

        for (let x = -widthHalf; x < widthHalf; x++) {
            for (let y = -heightHalf; y < heightHalf; y++) {
                const pos = {x: centerPosition.x + x, y: centerPosition.y + y};
                if (pos.x <= 1 || pos.x >= 48 || pos.y <= 1 || pos.y >= 48) {
                    continue;
                }

                if (terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) {
                    continue;
                }

                result.push(pos);
            }
        }

        return result;
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