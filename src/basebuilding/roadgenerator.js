const RoadGenerator = {
    generateAndGetRoads(room, layout) {
        // TODO: Store layouting result in memorieeeh and that instead of recalculating literally everything every tick

        const layoutCenterPosition = new RoomPosition(room.memory.baseCenterPosition.x, room.memory.baseCenterPosition.y, room.name);

        const layoutRoadRoomPositions = this.getRoomPositionsForRoadsInLayout(room.name, layout, layoutCenterPosition);

        const extraRoadPositions = {};
        for (let i = 0; i < room.sources.length; i++) {
            extraRoadPositions['source' + i] = this.getRoadPositionsToRoomObject(room.sources[i], layoutCenterPosition, layoutRoadRoomPositions, extraRoadPositions);
        }
        extraRoadPositions.controller = this.getRoadPositionsToRoomObject(room.controller, layoutCenterPosition, layoutRoadRoomPositions, extraRoadPositions);
        extraRoadPositions.mineral    = this.getRoadPositionsToRoomObject(room.mineral, layoutCenterPosition, layoutRoadRoomPositions, extraRoadPositions);

        room.memory.extraRoadPositions = extraRoadPositions;

        return extraRoadPositions;
    },

    generateRoadsForRemoteRoom(baseRoom, layout, remoteRoom) {
        // TODO: Store layouting result in memorieeeh and that instead of recalculating literally everything every tick

        const layoutCenterPosition = new RoomPosition(baseRoom.memory.baseCenterPosition.x, baseRoom.memory.baseCenterPosition.y, baseRoom.name);

        const layoutRoadRoomPositions = this.getRoomPositionsForRoadsInLayout(baseRoom.name, layout, layoutCenterPosition);

        const extraRoadPositions = {};
        let mergedRoadPositions = [];
        for (let i = 0; i < remoteRoom.sources.length; i++) {
            extraRoadPositions['source' + i] = this.getRoadPositionsToRoomObject(remoteRoom.sources[i], layoutCenterPosition, layoutRoadRoomPositions, extraRoadPositions);
            mergedRoadPositions = mergedRoadPositions.concat(extraRoadPositions['source' + i]);
        }

        console.log(JSON.stringify(extraRoadPositions));
        console.log(JSON.stringify(mergedRoadPositions));

        const extraRoadPositionsSplitByRoom = mergedRoadPositions.reduce((result, roomPosition) => {
            if (!result[roomPosition.roomName]) {
                result[roomPosition.roomName] = [];
            }

            result[roomPosition.roomName].push(roomPosition);
            return result;
        }, {});

        console.log(JSON.stringify(extraRoadPositionsSplitByRoom));

        for (const roomName in extraRoadPositionsSplitByRoom) {
            if (!Memory.rooms[roomName].extraRoadPositions) {
                Memory.rooms[roomName].extraRoadPositions = {}
            }

            if (roomName !== remoteRoom.name) {
                Memory.rooms[roomName].extraRoadPositions[remoteRoom.name] = extraRoadPositionsSplitByRoom[roomName];
            } else {
                Memory.rooms[roomName].extraRoadPositions.sources = extraRoadPositionsSplitByRoom[roomName];
            }
        }

        return extraRoadPositionsSplitByRoom;
    },

    getRoomPositionsForRoadsInLayout(roomName, layout, layoutCenterPosition) {
        const roadPositions = [];
        for (const road of layout.buildings.road.pos) {
            roadPositions.push(new RoomPosition(road.x + layoutCenterPosition.x, road.y + layoutCenterPosition.y, roomName));
        }
        return roadPositions;
    },

    getRoadPositionsToRoomObject(from, to, layoutRoadRoomPositions, extraRoadPositions) {
        const travelPath = Traveler.findTravelPath(from, to);
        const roadStartingPoint = travelPath.path[0];

        return this.findPathForRoads(roadStartingPoint, layoutRoadRoomPositions, extraRoadPositions);
    },

    findPathForRoads(roadStartingPoint, layoutRoadRoomPositions, extraRoadPositions) {
        // TODO: Add traversed rooms so we don't store/place roads twice
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

// TODO: remove global
global.RoadGenerator = RoadGenerator;

profiler.registerObject(RoadGenerator, "RoadGenerator");
module.exports = RoadGenerator;
