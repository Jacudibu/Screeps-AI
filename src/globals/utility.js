global.utility = {};

global.utility.getFutureGameTimeWithRandomOffset = function(ticks, offset = 5) {
    return Game.time + ticks + Math.round((Math.random() * offset * 2) - offset);
};

global.utility.getClosestObjectFromArray = function(fromObject, toArray) {
    return toArray
        .reduce((currentlyClosestObject, element) =>
            fromObject.pos.getRangeTo(currentlyClosestObject.pos) < fromObject.pos.getRangeTo(element.pos)
                ? currentlyClosestObject
                : element
        );
};

global.utility.countOwnedMinerals = function() {
    const minerals = {
        [RESOURCE_HYDROGEN]  : 0,
        [RESOURCE_OXYGEN]    : 0,
        [RESOURCE_UTRIUM]    : 0,
        [RESOURCE_LEMERGIUM] : 0,
        [RESOURCE_KEANIUM]   : 0,
        [RESOURCE_ZYNTHIUM]  : 0,
        [RESOURCE_CATALYST]  : 0,
    };

    let total = 0;
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        if (room.claimedByMe) {
            minerals[room.mineral.mineralType]++;
            total++;
        }
    }

    log.info("Total rooms: " + total + JSON.stringify(minerals, null, 2));
};

global.utility.countFreeTilesAroundRoomObject = function(roomObject) {
    const terrain = roomObject.room.getTerrain();
    let freeTileCount = 0;
    [roomObject.pos.x - 1, roomObject.pos.x, roomObject.pos.x + 1].forEach(x => {
        [roomObject.pos.y - 1, roomObject.pos.y, roomObject.pos.y + 1].forEach(y => {
            if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
                freeTileCount++;
            }
        });
    });

    return freeTileCount;
};

global.utility.isRoomSK = function(roomName) {
    const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
    let x = parsed[1] % 10;
    let y = parsed[2] % 10;
    return !( x === 5 && y === 5) && ((x >= 4) && (x <= 6)) && ((y >= 4) && (y <= 6));
};

global.utility.isRoomHighway = function(roomName) {
    const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
    return (parsed[1] % 10 === 0) || (parsed[2] % 10 === 0);
};