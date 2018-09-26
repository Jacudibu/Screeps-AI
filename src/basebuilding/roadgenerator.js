const ERR_NO_VISION = -100;

const RoadGenerator = {
    generateAndGetRoads(room, layout) {
        if (room.memory.layout.roads) {
            return room.memory.layout.roads;
        }

        const layoutCenterPosition = new RoomPosition(room.memory.baseCenterPosition.x, room.memory.baseCenterPosition.y, room.name);

        const layoutRoadRoomPositions = this.getRoomPositionsForRoadsInLayout(room.name, layout, layoutCenterPosition);

        const roads = {};
        for (let i = 0; i < room.sources.length; i++) {
            roads['source' + i] = this.getRoadPositionsToRoomObject(room.sources[i].pos, layoutCenterPosition, layoutRoadRoomPositions, roads);
        }
        roads.controller = this.getRoadPositionsToRoomObject(room.controller.pos, layoutCenterPosition, layoutRoadRoomPositions, roads);
        roads.mineral    = this.getRoadPositionsToRoomObject(room.mineral.pos, layoutCenterPosition, layoutRoadRoomPositions, roads);

        room.memory.layout.roads = roads;

        return roads;
    },

    generateRoadsForRemoteRoom(baseRoom, layout, remoteRoom) {
        // TODO: Store layouting result in memorieeeh and that instead of recalculating literally everything every tick

        const layoutCenterPosition = new RoomPosition(baseRoom.memory.baseCenterPosition.x, baseRoom.memory.baseCenterPosition.y, baseRoom.name);

        const layoutRoadRoomPositions = this.getRoomPositionsForRoadsInLayout(baseRoom.name, layout, layoutCenterPosition);

        const roadsA = {};
        let mergedRoadsA = [];
        for (let i = 0; i < remoteRoom.sources.length; i++) {
            roadsA['source' + i] = this.getRoadPositionsToRoomObject(remoteRoom.sources[i].pos, layoutCenterPosition, layoutRoadRoomPositions, roadsA);
            mergedRoadsA = mergedRoadsA.concat(roadsA['source' + i]);
        }

        const roadsB = {};
        let mergedRoadsB = [];
        for (let i = remoteRoom.sources.length - 1; i >= 0; i--) {
            roadsB['source' + i] = this.getRoadPositionsToRoomObject(remoteRoom.sources[i].pos, layoutCenterPosition, layoutRoadRoomPositions, roadsB);
            mergedRoadsB = mergedRoadsB.concat(roadsB['source' + i]);
        }

        let roads;
        if (mergedRoadsA.length < mergedRoadsB.length) {
            roads = mergedRoadsA;
        } else {
            roads = mergedRoadsB;
        }

        //console.log(JSON.stringify(roads));

        const roadsSplitByRoom = roads.reduce((result, roomPosition) => {
            if (!result[roomPosition.roomName]) {
                result[roomPosition.roomName] = [];
            }

            if (roomPosition.x > 0 && roomPosition.x < 49  && roomPosition.y > 0 && roomPosition.y < 49) {
                result[roomPosition.roomName].push(roomPosition);
            }
            return result;
        }, {});

        //console.log(JSON.stringify(roadsSplitByRoom));

        for (const roomName in roadsSplitByRoom) {
            if (!Memory.rooms[roomName]) {
                console.log("no room memory? " + roomName);
                continue;
            }

            if (!Memory.rooms[roomName].layout.roads) {
                Memory.rooms[roomName].layout.roads = {}
            }

            if (roomName === remoteRoom.name) {
                Memory.rooms[roomName].layout.roads.sources = roadsSplitByRoom[roomName];
            } else if (roomName === baseRoom.name) {
                // reverse entries so that they are ordered by distance to base center
                Memory.rooms[roomName].layout.roads[remoteRoom.name] = roadsSplitByRoom[roomName].reverse();
            } else {
                Memory.rooms[roomName].layout.roads[remoteRoom.name] = roadsSplitByRoom[roomName];
            }
        }

        return roadsSplitByRoom;
    },

    getRoomPositionsForRoadsInLayout(roomName, layout, layoutCenterPosition) {
        const roadPositions = [];
        for (const road of layout.buildings.road.pos) {
            roadPositions.push(new RoomPosition(road.x + layoutCenterPosition.x, road.y + layoutCenterPosition.y, roomName));
        }
        return roadPositions;
    },

    getRoadPositionsToRoomObject(fromPos, toPos, layoutRoadRoomPositions, roads) {
        const travelPath = Traveler.findTravelPath(fromPos, toPos);
        const roadStartingPoint = travelPath.path[0];

        return this.findPathForRoads(fromPos, toPos, roadStartingPoint, layoutRoadRoomPositions, roads);
    },

    findPathForRoads(fromPos, toPos, roadStartingPoint, layoutRoadRoomPositions, roads) {
        // TODO: Add traversed rooms so we don't store/place roads twice

        let allowedRooms;
        if (fromPos.roomName !== toPos.roomName) {
            allowedRooms = {};
            allowedRooms[fromPos.roomName] = true;
            const route = Game.map.findRoute(fromPos.roomName, toPos.roomName);
            //console.log("route: " + JSON.stringify(route));
            if (route !== ERR_NO_PATH) {
                for (let value of route) {
                    allowedRooms[value.room] = true;
                }
            }
        }
        console.log("allowed rooms: " + JSON.stringify(allowedRooms));

        for (let roomName in allowedRooms) {
            if (!Game.rooms[roomName]) {
                log.warning("No vision of " + roomName);
                return ERR_NO_VISION;
            }
        }

        // Every road in our layout is a goal since every layouted road has already been optimized and paths to the base.
        let goals = [].concat(layoutRoadRoomPositions);
        for (const roadKey in roads) {
            goals = goals.concat(roads[roadKey]);
        }

        // Every layouted road in other rooms along the path is also a goal. Phew. Thats a lot.
        for (let roomName in allowedRooms) {
            // allowed rooms is empty in base. In remotes we don't want other room's routes to interfere with the source route
            // we are also using roads already in here, so POI in the room won't have duplicate positions
            if (roomName !== fromPos.roomName) {
                if (Memory.rooms[roomName].layout.roads)
                    for (const roadKey in Memory.rooms[roomName].layout.roads) {
                        if (roadKey !== fromPos.roomName) {
                            // we want to regenerate the path if it was already set
                            goals = goals.concat(Memory.rooms[roomName].layout.roads[roadKey]);
                        }
                    }
            }
        }

        goals = goals.map(function(position) {
            return {
                pos: position,
                range: 1
            };
        });

        const result = PathFinder.search(roadStartingPoint, goals, {
            plainCost: 2,
            swampCost: 5,
            heuristicWeight: allowedRooms ? 2 : 1.25,
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
                    if (structure.structureType !== STRUCTURE_RAMPART && structure.structureType !== STRUCTURE_ROAD) {
                        costs.set(structure.pos.x, structure.pos.y, 255);
                    }
                });

                return costs;
            }
        });

        return result.path;
    },
};

// TODO: remove global
global.RoadGenerator = RoadGenerator;

profiler.registerObject(RoadGenerator, "RoadGenerator");
module.exports = RoadGenerator;
