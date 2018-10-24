require('layouts.layoutraws');

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

global.baseLayouts.diamond14x14 = offsetAndSortLayout(baseLayouts.diamond14x14, -7, -7);
global.baseLayouts.diamond14x14.width = 14;
global.baseLayouts.diamond14x14.height = 14;

global.baseLayouts.E55S47 = offsetAndSortLayout(baseLayouts.E55S47, -25, -8);
global.baseLayouts.E55S47.width = 14;
global.baseLayouts.E55S47.height = 14;

global.baseLayouts.E58S57 = offsetAndSortLayout(baseLayouts.E58S57, -26, -19);
global.baseLayouts.E58S57.width = 14;
global.baseLayouts.E58S57.height = 14;

global.baseLayouts.E54S41 = offsetAndSortLayout(baseLayouts.E54S41, -18, -39);
global.baseLayouts.E54S41.width = 14;
global.baseLayouts.E54S41.height = 14;

global.baseLayouts.E52S38 = offsetAndSortLayout(baseLayouts.E52S38, -10, -9);
global.baseLayouts.E52S38.width = 14;
global.baseLayouts.E52S38.height = 14;

global.baseLayouts.E52S44 = offsetAndSortLayout(baseLayouts.E52S44, -10, -9);
global.baseLayouts.E52S44.width = 14;
global.baseLayouts.E52S44.height = 14;



module.exports = {
    offsetLayout: offsetLayout,
};