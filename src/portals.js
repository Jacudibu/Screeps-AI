global.Portals = {
    addPermanentPortals(roomName, destinations) {
        if (!Memory.portals) {
            Memory.portals = {};
        }

        if (destinations instanceof String) {
            destinations = [destinations];
        }

        Memory.portals[roomName] = destinations;
    },
};