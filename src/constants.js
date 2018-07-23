global.HARVESTERS_DESIRED = 10;
global.UPGRADERS_DESIRED = 1;
global.BUILDERS_DESIRED = 1;

global.AUTO_SPAWN_TIMER = 30;

global.CRITICAL_TICKS_TO_LIVE_VALUE = 350;
global.ENERGY_COLLECTOR_EXTRA_BUFFER = 0;
global.COST_PER_WORKER_TIER = 200;
global.MINIMUM_HAUL_RESOURCE_AMOUNT = 100;
global.MINIMUM_HAUL_CONTAINER_RESOURCE_AMOUNT = 700;

global.WALLS_REPAIR_MAX = [];
global.WALLS_REPAIR_MAX[1] = 10000;
global.WALLS_REPAIR_MAX[2] = 20000;
global.WALLS_REPAIR_MAX[3] = 60000;
global.WALLS_REPAIR_MAX[4] = 150000;
global.WALLS_REPAIR_MAX[5] = 400000;
global.WALLS_REPAIR_MAX[6] = 800000;
global.WALLS_REPAIR_MAX[7] = 1600000;
global.WALLS_REPAIR_MAX[8] = 3200000;

global.TASK = {};
global.TASK.HARVEST_ENERGY = 'harvest_energy';
global.TASK.HARVEST_ENERGY_FETCH = 'harvest_energy_fetch';
global.TASK.HAUL_ENERGY = 'haul_energy';
global.TASK.MOVE_ONTO_CONTAINER = 'move_onto_container';
global.TASK.STORE_ENERGY = 'store_energy';
global.TASK.COLLECT_ENERGY = 'collect_energy';
global.TASK.UPGRADE_CONTROLLER = 'upgrade_controller';
global.TASK.SIGN_CONTROLLER = 'sign_controller';
global.TASK.RENEW_CREEP = 'renew_creep';
global.TASK.BUILD_STRUCTURE = 'build_structure';
global.TASK.REPAIR_STRUCTURE = 'repair_structure';
global.TASK.DECIDE_WHAT_TO_DO = 'decide_what_to_do';
global.TASK.MOVE_TO_ROOM = 'move_to_room';
global.TASK.WAIT_FOR_INPUT = 'wait_for_input';
global.TASK.ATTACK = 'attack';

global.ROLE = {};
global.ROLE.HARVESTER ='harvester';
global.ROLE.STRIP_HARVESTER = 'strip_harvester';
global.ROLE.HAULER ='hauler';
global.ROLE.BUILDER = 'builder';
global.ROLE.UPGRADER = 'upgrader';
global.ROLE.REPAIRER = 'repairer';
global.ROLE.REMOTE_WORKER = 'remote_worker';
global.ROLE.REMOTE_HAULER = 'remote_hauler';
global.ROLE.ATTACKER = 'attacker';