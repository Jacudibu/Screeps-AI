const RoadGenerator = {
    generateAndGetRoads(room, layout) {
        // TODO: Store layouting result in memorieeeh and that instead of recalculating literally everything every tick

        const layoutRoadRoomPositions = [];
        const baseOffset = room.memory.baseCenterPosition;
        for (const road of layout.buildings.road.pos) {
            layoutRoadRoomPositions.push(new RoomPosition(road.x + baseOffset.x, road.y + baseOffset.y, room.name));
        }

        const extraRoadPositions = {};
        for (let i = 0; i < room.sources.length; i++) {
            extraRoadPositions['source' + i] = this.getRoadPositionsToRoomObject(room, room.sources[i], layoutRoadRoomPositions, extraRoadPositions);
        }
        extraRoadPositions.controller = this.getRoadPositionsToRoomObject(room, room.controller, layoutRoadRoomPositions, extraRoadPositions);
        extraRoadPositions.mineral    = this.getRoadPositionsToRoomObject(room, room.mineral, layoutRoadRoomPositions, extraRoadPositions);

        room.memory.extraRoadPositions = extraRoadPositions;

        return extraRoadPositions;
    },

    getRoadPositionsToRoomObject(room, target, layoutRoadRoomPositions, extraRoadPositions) {
        const travelPath = Traveler.findTravelPath(target, room.spawns[0]);
        const roadStartingPoint = travelPath.path[0];

        return this.findPathForRoads(roadStartingPoint, layoutRoadRoomPositions, extraRoadPositions);
    },

    findPathForRoads(roadStartingPoint, layoutRoadRoomPositions, extraRoadPositions) {
        // Every road in our layout is a goal since every layouted road has already been optimized and paths to the base.
        let goals = [].concat(layoutRoadRoomPositions);
        for (const extraRoadKey in extraRoadPositions) {
            goals = goals.concat(extraRoadPositions[extraRoadKey]);
        }

        goals = goals.map(function(position) {
            return {
                pos: position,
                range: 1
            };
        });

        return PathFinder.search(roadStartingPoint, goals, {
            plainCost: 2,
            swampCost: 3,
            roomCallback: function(roomName) {
                let room = Game.rooms[roomName];
                if (!room) {
                    log.warning("no vision in room " + roomName + ", so road placement might be a bit wonkydonky right now. this needs to be tested anyway.");
                    return;
                }

                let costs = new PathFinder.CostMatrix;

                room.find(FIND_STRUCTURES).forEach(function(structure) {
                    if (structure.structureType === STRUCTURE_ROAD) {
                        costs.set(structure.pos.x, structure.pos.y, 1);
                    } else if (structure.structureType !== STRUCTURE_RAMPART) {
                        costs.set(structure.pos.x, structure.pos.y, 255);
                    }
                });

                return costs;
            }
        }).path;
    },
};

profiler.registerObject(RoadGenerator, "RoadGenerator");
module.exports = RoadGenerator;
