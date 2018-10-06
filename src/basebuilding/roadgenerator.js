const ERR_NO_VISION = -100;

const RoadGenerator = {
    generateAndGetRoads(room, layout, forceRegeneration = false) {
        if (room.memory.layout.roads && !forceRegeneration) {
            return room.memory.layout.roads;
        }

        const layoutCenterPosition = room._getCenterPosition();

        const layoutRoadRoomPositions = this.getRoomPositionsForRoadsInLayout(room.name, layout, layoutCenterPosition);

        const roads = {};
        for (let i = 0; i < room.sources.length; i++) {
            roads['source' + i] = this.findPathForRoads(room.sources[i].getNearbyContainerPosition(), layoutCenterPosition, layoutRoadRoomPositions, roads);
        }
        roads.controller = this.findPathForRoads(room.controller.pos, layoutCenterPosition, layoutRoadRoomPositions, roads);
        roads.mineral    = this.findPathForRoads(room.mineral.pos, layoutCenterPosition, layoutRoadRoomPositions, roads);

        room.memory.layout.roads = roads;

        return roads;
    },

    generateRoadsForRemoteRoom(baseRoom, layout, remoteRoom) {
        const layoutCenterPosition = new RoomPosition(baseRoom.memory.baseCenterPosition.x, baseRoom.memory.baseCenterPosition.y, baseRoom.name);

        const layoutRoadRoomPositions = this.getRoomPositionsForRoadsInLayout(baseRoom.name, layout, layoutCenterPosition);

        const roadsA = {};
        let mergedRoadsA = [];
        for (let i = 0; i < remoteRoom.sources.length; i++) {
            roadsA['source' + i] = this.findPathForRoads(remoteRoom.sources[i].getNearbyContainerPosition(), layoutCenterPosition, layoutRoadRoomPositions, roadsA);
            mergedRoadsA = mergedRoadsA.concat(roadsA['source' + i]);
        }

        const roadsB = {};
        let mergedRoadsB = [];
        for (let i = remoteRoom.sources.length - 1; i >= 0; i--) {
            roadsB['source' + i] = this.findPathForRoads(remoteRoom.sources[i].getNearbyContainerPosition(), layoutCenterPosition, layoutRoadRoomPositions, roadsB);
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

            if (!Memory.rooms[roomName].layout) {
                Memory.rooms[roomName].layout = {};
            }

            if (!Memory.rooms[roomName].layout.roads) {
                Memory.rooms[roomName].layout.roads = {};
            }

            if (roomName === remoteRoom.name) {
                Memory.rooms[roomName].layout.roads.sources = this.removeRoomNamesFromPositionArray(roadsSplitByRoom[roomName]);
            } else if (roomName === baseRoom.name) {
                // reverse entries so that they are ordered by distance to base center
                Memory.rooms[roomName].layout.roads[remoteRoom.name] =  this.removeRoomNamesFromPositionArray(roadsSplitByRoom[roomName].reverse());
            } else {
                Memory.rooms[roomName].layout.roads[remoteRoom.name] =  this.removeRoomNamesFromPositionArray(roadsSplitByRoom[roomName]);
            }
        }

        return roadsSplitByRoom;
    },

    removeRoomNamesFromPositionArray(array) {
        return array.map(function(pos) {return {x: pos.x, y: pos.y};});
    },

    getRoomPositionsForRoadsInLayout(roomName, layout, layoutCenterPosition) {
        const roadPositions = [];
        for (const road of layout.buildings.road.pos) {
            roadPositions.push(new RoomPosition(road.x + layoutCenterPosition.x, road.y + layoutCenterPosition.y, roomName));
        }
        return roadPositions;
    },

    findPathForRoads(fromPos, toPos, layoutRoadRoomPositions, roads) {
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

        goals = goals.map(function(position) {
            return {
                pos: position,
                range: 1
            };
        });

        const result = PathFinder.search(fromPos, goals, {
            plainCost: 2,
            swampCost: 5,
            heuristicWeight: allowedRooms ? 1.45 : 1.25,
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

                const terrain = room.getTerrain();
                const thingsToKeepDistanceFrom = [];
                thingsToKeepDistanceFrom.push(...room.find(FIND_MINERALS));
                thingsToKeepDistanceFrom.push(...room.find(FIND_SOURCES));
                if (room.controller) {
                    thingsToKeepDistanceFrom.push(room.controller);
                }
                thingsToKeepDistanceFrom.forEach(function(thing) {
                    for (let x = -1; x < 2; x++) {
                        for (let y = -1; y < 2; y++) {
                            if (terrain.get(thing.pos.x + x, thing.pos.y + y) !== TERRAIN_MASK_WALL) {
                                costs.set(thing.pos.x + x, thing.pos.y + y , 20);
                            }
                        }
                    }
                });

                if (Memory.rooms[roomName] && Memory.rooms[roomName].layout) {
                    if (Memory.rooms[roomName].layout.roads) {
                        for (const roadKey in Memory.rooms[roomName].layout.roads) {
                            if (roadKey !== fromPos.roomName) {
                                for (const pos of Memory.rooms[roomName].layout.roads[roadKey]) {
                                    costs.set(pos.x, pos.y, 1);
                                }
                            }
                        }
                    }
                }

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
