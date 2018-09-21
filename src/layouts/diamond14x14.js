// First base layout, yay!
const diamond14x14 = {"rcl":"8","buildings":{"road":{"pos":[{"x":5,"y":0},{"x":6,"y":0},{"x":8,"y":0},{"x":9,"y":0},{"x":4,"y":1},{"x":7,"y":1},{"x":10,"y":1},{"x":3,"y":2},{"x":6,"y":2},{"x":8,"y":2},{"x":11,"y":2},{"x":2,"y":3},{"x":5,"y":3},{"x":7,"y":3},{"x":9,"y":3},{"x":12,"y":3},{"x":1,"y":4},{"x":4,"y":4},{"x":7,"y":4},{"x":10,"y":4},{"x":13,"y":4},{"x":0,"y":5},{"x":3,"y":5},{"x":6,"y":5},{"x":8,"y":5},{"x":11,"y":5},{"x":13,"y":5},{"x":0,"y":6},{"x":2,"y":6},{"x":5,"y":6},{"x":7,"y":6},{"x":9,"y":6},{"x":12,"y":6},{"x":1,"y":7},{"x":3,"y":7},{"x":4,"y":7},{"x":10,"y":7},{"x":13,"y":7},{"x":0,"y":8},{"x":2,"y":8},{"x":5,"y":8},{"x":9,"y":8},{"x":11,"y":8},{"x":12,"y":8},{"x":0,"y":9},{"x":3,"y":9},{"x":6,"y":9},{"x":8,"y":9},{"x":9,"y":9},{"x":13,"y":9},{"x":1,"y":10},{"x":4,"y":10},{"x":7,"y":10},{"x":10,"y":10},{"x":13,"y":10},{"x":2,"y":11},{"x":5,"y":11},{"x":7,"y":11},{"x":11,"y":11},{"x":13,"y":11},{"x":3,"y":12},{"x":6,"y":12},{"x":8,"y":12},{"x":12,"y":12},{"x":4,"y":13},{"x":5,"y":13},{"x":7,"y":13},{"x":9,"y":13},{"x":10,"y":13},{"x":11,"y":13}]},"extension":{"pos":[{"x":5,"y":1},{"x":6,"y":1},{"x":8,"y":1},{"x":9,"y":1},{"x":1,"y":2},{"x":2,"y":2},{"x":4,"y":2},{"x":5,"y":2},{"x":7,"y":2},{"x":9,"y":2},{"x":10,"y":2},{"x":1,"y":3},{"x":3,"y":3},{"x":4,"y":3},{"x":6,"y":3},{"x":8,"y":3},{"x":10,"y":3},{"x":11,"y":3},{"x":2,"y":4},{"x":3,"y":4},{"x":5,"y":4},{"x":6,"y":4},{"x":8,"y":4},{"x":9,"y":4},{"x":11,"y":4},{"x":12,"y":4},{"x":1,"y":5},{"x":2,"y":5},{"x":4,"y":5},{"x":5,"y":5},{"x":10,"y":5},{"x":12,"y":5},{"x":1,"y":6},{"x":3,"y":6},{"x":4,"y":6},{"x":10,"y":6},{"x":11,"y":6},{"x":2,"y":7},{"x":11,"y":7},{"x":12,"y":7},{"x":1,"y":8},{"x":3,"y":8},{"x":4,"y":8},{"x":1,"y":9},{"x":2,"y":9},{"x":4,"y":9},{"x":2,"y":10},{"x":3,"y":10},{"x":5,"y":10},{"x":6,"y":10},{"x":8,"y":10},{"x":1,"y":11},{"x":3,"y":11},{"x":4,"y":11},{"x":6,"y":11},{"x":8,"y":11},{"x":1,"y":12},{"x":2,"y":12},{"x":4,"y":12},{"x":5,"y":12}]},"tower":{"pos":[{"x":7,"y":5},{"x":9,"y":5},{"x":5,"y":7},{"x":9,"y":7},{"x":5,"y":9},{"x":7,"y":9}]},"powerSpawn":{"pos":[{"x":6,"y":6}]},"spawn":{"pos":[{"x":8,"y":6},{"x":6,"y":7},{"x":8,"y":8}]},"terminal":{"pos":[{"x":8,"y":7}]},"link":{"pos":[{"x":6,"y":8}]},"storage":{"pos":[{"x":7,"y":8}]},"observer":{"pos":[{"x":10,"y":8}]},"lab":{"pos":[{"x":10,"y":9},{"x":11,"y":9},{"x":9,"y":10},{"x":11,"y":10},{"x":12,"y":10},{"x":9,"y":11},{"x":10,"y":11},{"x":12,"y":11},{"x":10,"y":12},{"x":11,"y":12}]},"nuker":{"pos":[{"x":7,"y":12}]}}};

const offsetAndSortLayout = function(layout, offsetX, offsetY) {
    return sortPositionsBasedOnDistanceFromNullPoint(offsetLayout(layout, offsetX, offsetY));
};

const offsetLayout = function(layout, offsetX, offsetY) {
    let buildings = {};
    for (const buildingType in layout.buildings) {
        let positions = [];
        const layoutPositions = layout.buildings[buildingType].pos;
        for (let i = 0; i < layoutPositions.length; i++) {
            positions.push({ x: layoutPositions[i].x + offsetX,
                y: layoutPositions[i].y + offsetY});
        }

        buildings[buildingType] = {pos: positions}
    }

    return {buildings: buildings};
};

const sortPositionsBasedOnDistanceFromNullPoint = function(layout) {
    let buildings = {};
    for (const buildingType in layout.buildings) {
        let layoutPositions = layout.buildings[buildingType].pos;
        layoutPositions.sort(
            (a, b) => {
                // noinspection JSSuspiciousNameCombination
                const distA = (Math.abs(a.x) + Math.abs(a.y));
                // noinspection JSSuspiciousNameCombination
                const distB = (Math.abs(b.x) + Math.abs(b.y));

                return distA - distB;
            });

        buildings[buildingType] = {pos: layoutPositions}
    }

    return {buildings: buildings};
};

global.baseLayouts.diamond14x14 = {};
global.baseLayouts.diamond14x14 = offsetAndSortLayout(diamond14x14, -7, -7);
global.baseLayouts.diamond14x14.width = 14;
global.baseLayouts.diamond14x14.heigth = 14;
global.baseLayouts.diamond14x14.centerOffsetX = -7;
global.baseLayouts.diamond14x14.centerOffsetY = -7;

