global.HARVESTERS_DESIRED = 10;
global.UPGRADERS_DESIRED = 1;
global.BUILDERS_DESIRED = 1;

global.AUTO_SPAWN_TIMER = 30;

global.RESPAWN_AFTER_TICKS = 1400;
global.CRITICAL_TICKS_TO_LIVE_VALUE = 350;
global.ENERGY_COLLECTOR_EXTRA_BUFFER = 0;
global.COST_PER_WORKER_TIER = 200;
global.MINIMUM_HAUL_RESOURCE_AMOUNT = 100;
global.MINIMUM_HAUL_CONTAINER_RESOURCE_AMOUNT = 700;
global.TERMINAL_MAX_ENERGY_STORAGE = 100000;
global.TERMINAL_MIN_ENERGY_STORAGE =  10000;
global.TERMINAL_MIN_ENERGY_STORAGE_FOR_HAULER_RETRIEVAL = 20000;

global.STORAGE_MAX_ENERGY = 500000;
global.STORAGE_MAX_MINERAL = 10000;

global.WALLS_REPAIR_MAX = [];
global.WALLS_REPAIR_MAX[1] = 10000;
global.WALLS_REPAIR_MAX[2] = 60000;
global.WALLS_REPAIR_MAX[3] = 120000;
global.WALLS_REPAIR_MAX[4] = 300000;
global.WALLS_REPAIR_MAX[5] = 800000;
global.WALLS_REPAIR_MAX[6] = 1600000;
global.WALLS_REPAIR_MAX[7] = 3200000;
global.WALLS_REPAIR_MAX[8] = 6400000;

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
global.TASK.DISMANTLE = 'dismantle';
global.TASK.CLAIM_CONTROLLER = 'claim_controller';
global.TASK.RESERVE_CONTROLLER = 'reserve_controller';
global.TASK.RECYCLE = 'recycle';
global.TASK.DEFEND_STAY_ON_RAMPART = 'defend_stay_on_rampart';
global.TASK.DEFEND_MELEE_CHARGE = 'defend_melee_charge';
global.TASK.HARVEST_MINERAL = 'harvest_mineral';
global.TASK.HAUL_RESOURCE = 'haul_resource';
global.TASK.STORE_MINERAL = 'store_mineral';
global.TASK.STORE_RESOURCE = 'store_resource';
global.TASK.ATTACK_CONTROLLER = 'attack_controller';
global.TASK.WAIT = 'wait';

global.ROLE = {};
global.ROLE.HARVESTER ='harvester';
global.ROLE.STRIP_HARVESTER = 'strip_harvester';
global.ROLE.HAULER ='hauler';
global.ROLE.BUILDER = 'builder';
global.ROLE.UPGRADER = 'upgrader';
global.ROLE.REPAIRER = 'repairer';
global.ROLE.REMOTE_WORKER = 'remote_worker';
global.ROLE.REMOTE_HAULER = 'remote_hauler';
global.ROLE.REMOTE_HARVESTER = 'remote_harvester';
global.ROLE.REMOTE_REPAIRER = 'remote_repairer';
global.ROLE.REMOTE_UPGRADER = 'remote_upgrader';
global.ROLE.ATTACKER = 'attacker';
global.ROLE.CLAIMER = 'claimer';
global.ROLE.RESERVER = 'reserver';
global.ROLE.DISMANTLER = 'dismantler';
global.ROLE.DEFENDER = 'defender';
global.ROLE.CARRIER = 'carrier';
global.ROLE.MINERAL_HARVESTER = 'mineral_harvester';
global.ROLE.CLAIMER_ATTACKER = 'claimer_attacker';
global.ROLE.GUIDED_RANGED_ATTACKER = 'guided_ranged_attacker';

global.LABTASK = {};
global.LABTASK.RUN_REACTION = "run_reaction";
global.LABTASK.BOOST_CREEP = "boost_creep";
global.LABTASK.DECIDE_WHAT_TO_DO = "decide_what_to_do";
global.LABTASK.MAKE_EMPTY = "make_empty";

global.BASE_MINERALS = [
    RESOURCE_ENERGY,
    RESOURCE_POWER,

    RESOURCE_HYDROGEN,
    RESOURCE_OXYGEN,
    RESOURCE_UTRIUM,
    RESOURCE_LEMERGIUM,
    RESOURCE_KEANIUM,
    RESOURCE_ZYNTHIUM,
    RESOURCE_CATALYST,
];