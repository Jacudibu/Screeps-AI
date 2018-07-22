global.HARVESTERS_DESIRED = 10;
global.UPGRADERS_DESIRED = 1;
global.BUILDERS_DESIRED = 1;

global.AUTO_SPAWN_TIMER = 10;

global.CRITICAL_TICKS_TO_LIVE_VALUE = 350;
global.ENERGY_COLLECTOR_EXTRA_BUFFER = 0;
global.COST_PER_WORKER_TIER = 200;
global.MINIMUM_HAUL_RESOURCE_AMOUNT = 750;

global.TASK = {};
global.TASK.HARVEST_ENERGY = 'harvest_energy';
global.TASK.HARVEST_ENERGY_FETCH = 'harvest_energy_fetch';
global.TASK.HAUL_ENERGY = 'haul_energy';
global.TASK.STORE_ENERGY = 'store_energy';
global.TASK.COLLECT_ENERGY = 'collect_energy';
global.TASK.UPGRADE_CONTROLLER = 'upgrade_controller';
global.TASK.SIGN_CONTROLLER = 'sign_controller';
global.TASK.RENEW_CREEP = 'renew_creep';
global.TASK.BUILD_STRUCTURE = 'build_structure';
global.TASK.REPAIR_STRUCTURE = 'repair_structure';

global.ROLE = {};
global.ROLE.HARVESTER ='harvester';
global.ROLE.STRIP_HARVESTER = 'strip_harvester';
global.ROLE.HAULER ='hauler';
global.ROLE.BUILDER = 'builder';
global.ROLE.UPGRADER = 'upgrader';
global.ROLE.REPAIRER = 'repairer';