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

global.baseLayouts.E52S44 = offsetAndSortLayout(baseLayouts.E52S44, -28, -30);
global.baseLayouts.E52S44.width = 14;
global.baseLayouts.E52S44.height = 14;

global.baseLayouts.E59S42 = offsetAndSortLayout(baseLayouts.E59S42, -21, -31);
global.baseLayouts.E59S42.width = 14;
global.baseLayouts.E59S42.height = 14;

global.baseLayouts.E54S58 = offsetAndSortLayout(baseLayouts.E54S58, -35, -27);
global.baseLayouts.E54S58.width = 14;
global.baseLayouts.E54S58.height = 14;

global.baseLayouts.E58S49 = offsetAndSortLayout(baseLayouts.E58S49, -25, -18);
global.baseLayouts.E58S49.width = 14;
global.baseLayouts.E58S49.height = 14;

global.baseLayouts.E59S45 = offsetAndSortLayout(baseLayouts.E59S45, -18, -23);
global.baseLayouts.E59S45.width = 14;
global.baseLayouts.E59S45.height = 14;

global.baseLayouts.E58S47 = offsetAndSortLayout(baseLayouts.E58S47, -26, -28);
global.baseLayouts.E58S47.width = 14;
global.baseLayouts.E58S47.height = 14;

global.baseLayouts.E52S48 = offsetAndSortLayout(baseLayouts.E52S48, -27, -30);
global.baseLayouts.E52S48.width = 14;
global.baseLayouts.E52S48.height = 14;

global.baseLayouts.E59S53 = offsetAndSortLayout(baseLayouts.E59S53, -37, -9);
global.baseLayouts.E59S53.width = 14;
global.baseLayouts.E59S53.height = 14;

global.baseLayouts.E56S43 = offsetAndSortLayout(baseLayouts.E56S43, -29, -41);
global.baseLayouts.E56S43.width = 14;
global.baseLayouts.E56S43.height = 14;

global.baseLayouts.E51S35 = offsetAndSortLayout(baseLayouts.E51S35, -38, -11);
global.baseLayouts.E51S35.width = 14;
global.baseLayouts.E51S35.height = 14;

global.baseLayouts.E48S49 = offsetAndSortLayout(baseLayouts.E48S49, -31, -23);
global.baseLayouts.E48S49.width = 14;
global.baseLayouts.E48S49.height = 14;

global.baseLayouts.E57S38 = offsetAndSortLayout(baseLayouts.E57S38, -25, -22);
global.baseLayouts.E57S38.width = 14;
global.baseLayouts.E57S38.height = 14;

global.baseLayouts.E51S56 = offsetAndSortLayout(baseLayouts.E51S56, -16, -21);
global.baseLayouts.E51S56.width = 14;
global.baseLayouts.E51S56.height = 14;

global.baseLayouts.E55S52 = offsetAndSortLayout(baseLayouts.E55S52, -42, -11);
global.baseLayouts.E55S52.width = 14;
global.baseLayouts.E55S52.height = 14;

global.baseLayouts.E53S59 = offsetAndSortLayout(baseLayouts.E53S59, -25, -30);
global.baseLayouts.E53S59.width = 14;
global.baseLayouts.E53S59.height = 14;


module.exports = {
    offsetLayout: offsetLayout,
};