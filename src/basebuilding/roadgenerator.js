const ERR_NO_VISION = -100;

const RoadGenerator = {
    generateAndGetRoads(room, layout) {
        // TODO: Store layouting result in memorieeeh and that instead of recalculating literally everything every tick

        const layoutCenterPosition = new RoomPosition(room.memory.baseCenterPosition.x, room.memory.baseCenterPosition.y, room.name);

        const layoutRoadRoomPositions = this.getRoomPositionsForRoadsInLayout(room.name, layout, layoutCenterPosition);

        const extraRoadPositions = {};
        for (let i = 0; i < room.sources.length; i++) {
            extraRoadPositions['source' + i] = this.getRoadPositionsToRoomObject(room.sources[i].pos, layoutCenterPosition, layoutRoadRoomPositions, extraRoadPositions);
        }
        extraRoadPositions.controller = this.getRoadPositionsToRoomObject(room.controller.pos, layoutCenterPosition, layoutRoadRoomPositions, extraRoadPositions);
        extraRoadPositions.mineral    = this.getRoadPositionsToRoomObject(room.mineral.pos, layoutCenterPosition, layoutRoadRoomPositions, extraRoadPositions);

        room.memory.extraRoadPositions = extraRoadPositions;

        for (const remoteRoom of room.memory.remoteMiningRooms) {
            if (!Game.rooms[remoteRoom]) {
                continue;
            }
            this.generateRoadsForRemoteRoom(room, layout, Game.rooms[remoteRoom])
        }

        return extraRoadPositions;
    },

    generateRoadsForRemoteRoom(baseRoom, layout, remoteRoom) {
        // TODO: Store layouting result in memorieeeh and that instead of recalculating literally everything every tick

        const layoutCenterPosition = new RoomPosition(baseRoom.memory.baseCenterPosition.x, baseRoom.memory.baseCenterPosition.y, baseRoom.name);

        const layoutRoadRoomPositions = this.getRoomPositionsForRoadsInLayout(baseRoom.name, layout, layoutCenterPosition);

        const extraRoadPositionsA = {};
        let mergedRoadPositionsA = [];
        for (let i = 0; i < remoteRoom.sources.length; i++) {
            extraRoadPositionsA['source' + i] = this.getRoadPositionsToRoomObject(remoteRoom.sources[i].pos, layoutCenterPosition, layoutRoadRoomPositions, extraRoadPositionsA);
            mergedRoadPositionsA = mergedRoadPositionsA.concat(extraRoadPositionsA['source' + i]);
        }

        const extraRoadPositionsB = {};
        let mergedRoadPositionsB = [];
        for (let i = remoteRoom.sources.length - 1; i >= 0; i--) {
            extraRoadPositionsB['source' + i] = this.getRoadPositionsToRoomObject(remoteRoom.sources[i].pos, layoutCenterPosition, layoutRoadRoomPositions, extraRoadPositionsB);
            mergedRoadPositionsB = mergedRoadPositionsB.concat(extraRoadPositionsB['source' + i]);
        }

        let mergedRoadPositions;
        if (mergedRoadPositionsA.length < mergedRoadPositionsB.length) {
            mergedRoadPositions = mergedRoadPositionsA;
        } else {
            mergedRoadPositions = mergedRoadPositionsB;
        }

        //console.log(JSON.stringify(mergedRoadPositions));

        const extraRoadPositionsSplitByRoom = mergedRoadPositions.reduce((result, roomPosition) => {
            if (!result[roomPosition.roomName]) {
                result[roomPosition.roomName] = [];
            }

            result[roomPosition.roomName].push(roomPosition);
            return result;
        }, {});

        //console.log(JSON.stringify(extraRoadPositionsSplitByRoom));

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

    getRoadPositionsToRoomObject(fromPos, toPos, layoutRoadRoomPositions, extraRoadPositions) {
        const travelPath = Traveler.findTravelPath(fromPos, toPos);
        const roadStartingPoint = travelPath.path[0];

        return this.findPathForRoads(fromPos, toPos, roadStartingPoint, layoutRoadRoomPositions, extraRoadPositions);
    },

    findPathForRoads(fromPos, toPos, roadStartingPoint, layoutRoadRoomPositions, extraRoadPositions) {
        // TODO: Add traversed rooms so we don't store/place roads twice

        let allowedRooms;
        if (fromPos.roomName !== toPos.roomName) {
            allowedRooms = {};
            allowedRooms[fromPos.roomName] = true;
            const route = Game.map.findRoute(fromPos.roomName, toPos.roomName);
            if (route !== ERR_NO_PATH) {
                for (let value of route) {
                    allowedRooms[value.room] = true;
                }
            }
        }

        for (let roomName in allowedRooms) {
            if (!Game.rooms[roomName]) {
                return ERR_NO_VISION;
            }
        }

        // Every road in our layout is a goal since every layouted road has already been optimized and paths to the base.
        let goals = [].concat(layoutRoadRoomPositions);
        for (const extraRoadKey in extraRoadPositions) {
            goals = goals.concat(extraRoadPositions[extraRoadKey]);
        }

        // Every layouted road in other rooms along the path is also a goal. Phew. Thats a lot.
        for (let roomName in allowedRooms) {
            if (Memory.rooms[roomName].extraRoadPositions)
            for (const extraRoadKey in Memory.rooms[roomName].extraRoadPositions) {
                goals = goals.concat(Memory.rooms[roomName].extraRoadPositions[extraRoadKey]);
            }
        }

        goals = goals.map(function(position) {
            return {
                pos: position,
                range: 1
            };
        });

        const result = PathFinder.search(roadStartingPoint, goals, {
            plainCost: 1,
            swampCost: 2.5,
            heuristicWeight: 1.75,
            roomCallback: function(roomName) {
                if (allowedRooms) {
                    if (!allowedRooms[roomName]) {
                        return false;
                    }
                }

                let room = Game.rooms[roomName];
                if (!room) {
                    log.warning("no vision in room " + roomName + ", so road placement might be a bit wonkydonky right now. this needs to be tested anyway.");
                    return;
                }

                let costs = new PathFinder.CostMatrix;

                room.find(FIND_STRUCTURES).forEach(function(structure) {
                    if (structure.structureType !== STRUCTURE_RAMPART) {
                        costs.set(structure.pos.x, structure.pos.y, 255);
                    }
                });

                return costs;
            }
        });

        if (result.incomplete) {
        }
        return result.path;
    },
};

// TODO: remove global
global.RoadGenerator = RoadGenerator;

profiler.registerObject(RoadGenerator, "RoadGenerator");
module.exports = RoadGenerator;
