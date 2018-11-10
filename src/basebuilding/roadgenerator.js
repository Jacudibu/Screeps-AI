const ERR_NO_VISION = -100;
const TUNNEL_PATH_COST = 60;

const RoadGenerator = {
    generateAndGetRoads(room, layout, forceRegeneration = false) {
        if (room.memory.layout.roads && !forceRegeneration) {
            return room.memory.layout.roads;
        }

        const layoutCenterPosition = room._getCenterPosition();

        const roads = {};
        let roadsGeneratedByNow = [];
        for (let i = 0; i < room.sources.length; i++) {
            const fromPos = room.sources[i].calculateContainerConstructionSitePosition(layoutCenterPosition);
            roads['source' + i] = this.findPathForRoads(fromPos, layoutCenterPosition, layout, roadsGeneratedByNow).path;
            roads['source' + i] = this.removeDuplicateRoadPositionsInSameRoom(roads['source' + i], layout, roadsGeneratedByNow);
            roadsGeneratedByNow = roadsGeneratedByNow.concat(roads['source' + i]);
        }
        const mineralFromPos = room.mineral.calculateContainerConstructionSitePosition(layoutCenterPosition);

        roads.controller = this.findPathForRoads(room.controller.pos, layoutCenterPosition, layout, roadsGeneratedByNow).path;
        roads.controller = this.removeDuplicateRoadPositionsInSameRoom(roads.controller, layout, roadsGeneratedByNow);
        roadsGeneratedByNow = roadsGeneratedByNow.concat(roads.controller);

        roads.mineral    = this.findPathForRoads(mineralFromPos, layoutCenterPosition, layout, roadsGeneratedByNow).path;
        roads.mineral    = this.removeDuplicateRoadPositionsInSameRoom(roads.mineral, layout, roadsGeneratedByNow);

        for (const roadKey in roads) {
            roads[roadKey] = this.removeRoomNamesFromPositionArray(roads[roadKey]);
        }

        room.memory.layout.roads = roads;
        room._forceConstructionTimerReset();

        return roads;
    },

    generateRoadsForRemoteRoom(baseRoom, layout, remoteRoom) {
        const layoutCenterPosition = baseRoom._getCenterPosition();

        let roadsA = [];
        let totalCostA = 0;
        for (let i = 0; i < remoteRoom.sources.length; i++) {
            const fromPos = remoteRoom.sources[i].calculateContainerConstructionSitePosition(layoutCenterPosition);
            const pathFinderResult = this.findPathForRoads(fromPos, layoutCenterPosition, layout, roadsA);

            if (pathFinderResult === ERR_NO_VISION) {
                return ERR_NO_VISION;
            }

            for (const roadPos of pathFinderResult.path) {
                if (!_.find(roadsA, road => roadPos.isEqualTo(road))) {
                    roadsA.push(roadPos);
                }
            }
            totalCostA += pathFinderResult.cost;
        }

        let roadsB = [];
        let totalCostB = 0;
        for (let i = remoteRoom.sources.length - 1; i >= 0; i--) {
            const fromPos = remoteRoom.sources[i].calculateContainerConstructionSitePosition(layoutCenterPosition);
            const pathFinderResult = this.findPathForRoads(fromPos, layoutCenterPosition, layout, roadsB);

            if (pathFinderResult === ERR_NO_VISION) {
                return ERR_NO_VISION;
            }

            for (const roadPos of pathFinderResult.path) {
                if (!_.find(roadsB, road => roadPos.isEqualTo(road))) {
                    roadsB.push(roadPos);
                }
            }
            totalCostB += pathFinderResult.cost;
        }

        //console.log("a: length " + roadsA.length + " | cost " + totalCostA);
        //console.log("b: length " + roadsB.length + " | cost " + totalCostB);
        let roads;
        if (roadsA.length === roadsB.length) {
            if (totalCostA < totalCostB) {
                roads = roadsA;
            } else {
                roads = roadsB;
            }
        } else {
            if (roadsA.length < roadsB.length) {
                roads = roadsA;
            } else {
                roads = roadsB;
            }
        }

        const roadsSplitByRoom = roads.reduce((result, roomPosition) => {
            if (!result[roomPosition.roomName]) {
                result[roomPosition.roomName] = [];
            }

            if (roomPosition.x > 0 && roomPosition.x < 49  && roomPosition.y > 0 && roomPosition.y < 49) {
                result[roomPosition.roomName].push(roomPosition);
            }
            return result;
        }, {});

        for (const roomName in roadsSplitByRoom) {
            if (!Memory.rooms[roomName]) {
                log.warning("no room memory? " + roomName);
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
                const posArray = this.removeRoomNamesFromPositionArray(roadsSplitByRoom[roomName].reverse());
                Memory.rooms[roomName].layout.roads[remoteRoom.name] = this.removeDuplicateRoadPositionsInSameRoom(posArray, Memory.rooms[roomName].layout);
            } else {
                const posArray = this.removeRoomNamesFromPositionArray(roadsSplitByRoom[roomName]);
                Memory.rooms[roomName].layout.roads[remoteRoom.name] = this.removeDuplicateRoadPositionsInSameRoom(posArray, Memory.rooms[roomName].layout);
            }

            const currentRoom = Game.rooms[roomName];
            if (currentRoom) {
                currentRoom._forceConstructionTimerReset();
            }
        }

        return roadsSplitByRoom;
    },

    removeRoomNamesFromPositionArray(array) {
        return array.map(function(pos) {return {x: pos.x, y: pos.y};});
    },

    removeDuplicateRoadPositionsInSameRoom(roadPositionArray, layout, roadsGeneratedUntilNow = null) {
        const result = [];

        loop: for (const position of roadPositionArray) {
            if (_.find(result, road => this.arePositionsEqualOnXY(road, position))) {
                continue;
            }

            if (roadsGeneratedUntilNow) {
                if (_.find(roadsGeneratedUntilNow, road => this.arePositionsEqualOnXY(road, position))) {
                    continue;
                }
            }

            if (layout) {
                if (layout.roads) {
                    for (const key in layout.roads) {
                        if (_.find(layout.roads[key], road => this.arePositionsEqualOnXY(road, position))) {
                            continue loop;
                        }
                    }
                }

                if (layout.buildings && layout.buildings.road) {
                    if (_.find(layout.buildings.road.pos, road => this.arePositionsEqualOnXY(road, position))) {
                        continue;
                    }
                }
            }
            result.push(position);
        }

        return result;
    },

    arePositionsEqualOnXY(posA, posB) {
        return posA.x === posB.x && posA.y === posB.y;
    },

    arePositionsEqualOnXYRoom(posA, posB) {
        return posA.x === posB.x && posA.y === posB.y && posA.roomName === posB.roomName;
    },

    findPathForRoads(fromPos, baseCenterPosition, roomLayout, roadsGeneratedByNow) {
        // TODO: Add traversed rooms so we don't store/place roadsGeneratedByNow twice

        let allowedRooms;
        if (fromPos.roomName !== baseCenterPosition.roomName) {
            allowedRooms = {};
            allowedRooms[fromPos.roomName] = true;
            const route = Game.map.findRoute(fromPos.roomName, baseCenterPosition.roomName);
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

        return PathFinder.search(fromPos, {pos: baseCenterPosition, range: 1}, {
            plainCost: 2,
            swampCost: 5,
            heuristicWeight: allowedRooms ? 1.45 : 1.25,
            roomCallback: function(roomName) {
                /*
                if (allowedRooms) {
                    if (!allowedRooms[roomName]) {
                        return false;
                    }
                }
                */

                let room = Game.rooms[roomName];
                if (!room) {
                    log.warning("no vision in room " + roomName + ", so road placement might be a bit wonkydonky right now. this needs to be tested anyway.");
                    return;
                }

                let costs = new PathFinder.CostMatrix;
                const terrain = room.getTerrain();

                for (let x = 1; x < 49; x++) {
                    for (let y = 1; y < 49; y++) {
                        if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
                            costs.set(x, y, TUNNEL_PATH_COST);
                        }
                    }
                }

                // Existing Structures in owned rooms
                if (room.claimedByMe) {
                    room.find(FIND_STRUCTURES).forEach(function (structure) {
                        if (structure.structureType !== STRUCTURE_RAMPART && structure.structureType !== STRUCTURE_ROAD) {
                            costs.set(structure.pos.x, structure.pos.y, 255);
                        }
                    });
                }

                // Minerals, Sources & Controllers minimum distance 1
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

                // Already generated roads by now
                for (const roadPos of roadsGeneratedByNow) {
                    //console.log(JSON.stringify(roadPos));
                    if (roadPos.roomName === roomName) {
                        costs.set(roadPos.x, roadPos.y, 1);
                    }
                }

                // Roads which have already been generated / placed for some other room
                if (Memory.rooms[roomName] && Memory.rooms[roomName].layout) {
                    for (const roadKey in Memory.rooms[roomName].layout.roads) {
                        if (roadKey === fromPos.roomName) {
                            continue;
                        }

                        for (const roadPos of Memory.rooms[roomName].layout.roads[roadKey]) {
                            costs.set(roadPos.x, roadPos.y, 1);
                        }
                    }
                }

                if (roomName !== baseCenterPosition.roomName) {
                    return costs;
                }

                // Base Layout
                for (const buildingKey in roomLayout.buildings) {
                    if (buildingKey === STRUCTURE_ROAD) {
                        for (const roadPos of roomLayout.buildings[buildingKey].pos) {
                            costs.set(roadPos.x, roadPos.y, 1);
                        }
                        continue;
                    }

                    for (const structurePos of roomLayout.buildings[buildingKey].pos) {
                        costs.set(structurePos.x, structurePos.y, 255);
                    }
                }

                return costs;
            }
        });
    },
};

// TODO: remove global
global.RoadGenerator = RoadGenerator;

profiler.registerObject(RoadGenerator, "RoadGenerator");
module.exports = RoadGenerator;
