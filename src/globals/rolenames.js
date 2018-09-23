const ROLE_NAMES = {};

// INFRASTRUCTURE CREEPS
ROLE_NAMES[ROLE.HARVESTER]              = 'hv';
ROLE_NAMES[ROLE.MINERAL_HARVESTER]      = 'mhv';
ROLE_NAMES[ROLE.EARLY_RCL_HARVESTER]    = 'earlybird';
ROLE_NAMES[ROLE.HAULER]                 = 'ha';
ROLE_NAMES[ROLE.BUILDER]                = 'b';
ROLE_NAMES[ROLE.UPGRADER]               = 'u';
ROLE_NAMES[ROLE.REPAIRER]               = 'r';
ROLE_NAMES[ROLE.CARRIER]                = 'c';
ROLE_NAMES[ROLE.REMOTE_WORKER]          = 'rwo';
ROLE_NAMES[ROLE.REMOTE_HAULER]          = 'rha';
ROLE_NAMES[ROLE.REMOTE_HARVESTER]       = 'rhv';
ROLE_NAMES[ROLE.REMOTE_REPAIRER]        = 'rr';
ROLE_NAMES[ROLE.REMOTE_UPGRADER]        = 'ru';
ROLE_NAMES[ROLE.CLAIMER]                = 'claimer';
ROLE_NAMES[ROLE.RESERVER]               = 'reserver';

// Offensive Creeps
ROLE_NAMES[ROLE.ATTACKER]               = 'behemoth';
ROLE_NAMES[ROLE.GUIDED_RANGED_ATTACKER] = 'spitter';
ROLE_NAMES[ROLE.DISMANTLER]             = 'badlifedecision';

ROLE_NAMES[ROLE.CLAIMER_ATTACKER]       = 'claimerattacker';

// Defenseive Creeps
ROLE_NAMES[ROLE.DEFENDER]               = 'guardian';


/* Random name ideas
 *
 * Goblin - light attackers
 * Kobold - thieves
 */


const getRoleName = function(role) {
    if (ROLE_NAMES[role]) {
        return ROLE_NAMES[role];
    }

    return role;
};

module.exports = {
    getRoleName: getRoleName,
};