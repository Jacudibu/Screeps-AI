const SCOUT_SPAWN_INTERVAL = 200;
const nextScoutSpawns = {};
const ticksAtMaxEnergyWithoutSpawningSomething = {};

const AUTO_UPGRADER_SPAWN_INTERVAL = 30;

const spawnlogic = {
    run() {
        for (const i in Game.rooms) {
            let room = Game.rooms[i];
            this.tryRunSpawnLogic(room);
        }
    },

    tryRunSpawnLogic(room) {
        try {
            this.runSpawnLogic(room);
        } catch (e) {
            let message = room + " RunSpawnLogic -> caught error: " + e;
            if (e.stack) {
                message += "\nTrace:\n" + e.stack;
            }
            log.error(message);
        }
    },

    runSpawnLogic(room) {
        const spawns = room.mySpawns;
        if (spawns.length === 0) {
            return;
        }

        let allSpawnsBusy = true;
        for(let i = 0; i < spawns.length; i++) {
            let spawn = spawns[i];
            if (spawn && spawn.spawning) {
                spawn.drawSpawnInfo();
            } else {
                allSpawnsBusy = false;
            }
        }

        if (allSpawnsBusy) {
            return;
        }

        if (room.isSpawnQueueEmpty()) {
            this.tryAddingNewCreepToSpawnQueue(room, spawns);
        } else {
            if (this.isDefenderNeeded(room.name)) {
                this.addDefenderToSpawnQueue(room, room.name);
            } else {
                const remoteThatNeedsDefender = this.searchRemoteWhichNeedsDefender(room);
                if (remoteThatNeedsDefender) {
                    this.addDefenderToSpawnQueue(room, remoteThatNeedsDefender);
                }
            }
        }

        if (this.checkIfRoomIsAliveAndReviveIfNecessary(room)) {
            return;
        }

        // If something was added the spawnqueue was changed
        if (!room.isSpawnQueueEmpty()) {
            if (this.searchUnoccupiedSpawnAndSpawnNewCreepWithArgs(spawns, this.peekFirstElementFromSpawnQueue(room)) === OK) {
                this.shiftElementFromSpawnQueue(room);
            }
            ticksAtMaxEnergyWithoutSpawningSomething[room.name] = 0;
        } else {
            // TODO: Remove this if. Just a safety net so we don't start spawning faulty scouts on the main server.
            if (Game.shard.name === 'screepsplus1' || Game.shard.name === 'swc' ) {
                if (!nextScoutSpawns[room.name] || nextScoutSpawns[room.name] < Game.time) {
                    nextScoutSpawns[room.name] = utility.getFutureGameTimeWithRandomOffset(SCOUT_SPAWN_INTERVAL);
                    this.searchUnoccupiedSpawnAndSpawnNewCreepWithArgs(spawns, {role: ROLE.SCOUT});
                }
            }

            if (room.energyCapacityAvailable === room.energyAvailable) {
                if (!ticksAtMaxEnergyWithoutSpawningSomething[room.name]) {
                    ticksAtMaxEnergyWithoutSpawningSomething[room.name] = 0;
                }

                ticksAtMaxEnergyWithoutSpawningSomething[room.name]++;
                if (ticksAtMaxEnergyWithoutSpawningSomething[room.name] > AUTO_UPGRADER_SPAWN_INTERVAL) {
                    if (room.energyCapacityAvailable >= 550 && room.controller.level < 8) {
                        ticksAtMaxEnergyWithoutSpawningSomething[room.name] = 0;
                        this.searchUnoccupiedSpawnAndSpawnNewCreepWithArgs(spawns, {role: ROLE.UPGRADER});
                    }

                }
            }
        }

        room.memory.allowEnergyCollection = room.isSpawnQueueEmpty() && !room.storage;
    },

    checkAndSpawnLowRCLDefenderIfNecessary(room) {
        if (room.myTowers.length > 0) {
            return false;
        }

        if (room.find(FIND_HOSTILE_CREEPS).length > 0) {
            if (this.countNumberOfCreepsWithRole(room, ROLE.ATTACKER) === 0) {
                // Shoo scouts away, so they don't block construction sites.
                room.addToSpawnQueueStart({role: ROLE.ATTACKER});
                return true;
            }
        }
    },

    tryAddingNewCreepToSpawnQueue(room, spawns) {
        if (room.energyCapacityAvailable < 550) {
            // Early RCL. CUUUUTE!
            if (this.isRoleNeeded(room, spawns, ROLE.EARLY_RCL_HARVESTER)) {
                room.addToSpawnQueueStart({role: ROLE.EARLY_RCL_HARVESTER});
                return;
            }

            if (this.checkAndSpawnLowRCLDefenderIfNecessary(room)) {
                return;
            }
        } else {
            if (this.countNumberOfCreepsWithRole(room, ROLE.HARVESTER) > 0 && this.countNumberOfCreepsWithRole(room, ROLE.HAULER) === 0) {
                if (this.isRoleNeeded(room, spawns, ROLE.HAULER)) {
                    room.addToSpawnQueueStart({role: ROLE.HAULER});
                    return;
                }
            }

            if (this.isRoleNeeded(room, spawns, ROLE.HARVESTER)) {
                room.addToSpawnQueueStart({role: ROLE.HARVESTER});
                return;
            }

            if (this.isRoleNeeded(room, spawns, ROLE.HAULER)) {
                room.addToSpawnQueueEnd({role: ROLE.HAULER});
                return;
            }

            if (this.isDefenderNeeded(room.name)) {
                this.addDefenderToSpawnQueue(room, room.name);
                return;
            }

            if (this.isRoleNeeded(room, spawns, ROLE.UPGRADER)) {
                room.addToSpawnQueueEnd({role: ROLE.UPGRADER});
                return;
            }

            if (this.isRoleNeeded(room, spawns, ROLE.BUILDER) && room.find(FIND_CONSTRUCTION_SITES).length > 0) {
                room.addToSpawnQueueEnd({role: ROLE.BUILDER});
                return;
            }

            if (this.isRoleNeeded(room, spawns, ROLE.REPAIRER)) {
                room.addToSpawnQueueEnd({role: ROLE.REPAIRER});
                return;
            }
        }

        if (room.extractor && room.mineral && room.mineral.mineralAmount > 0 && !room.memory.isMineralHarvesterAssigned && room.controller.level >= 6) {
            room.addToSpawnQueueEnd({role: ROLE.MINERAL_HARVESTER});
            room.memory.isMineralHarvesterAssigned = true;
            return;
        }

        this.checkRemoteMiningRooms(room);
    },

    areThereEnoughResourcesToSpawnRole(room) {
        return room.energyCapacityAvailable === room.energyAvailable;
    },

    shiftElementFromSpawnQueue(room) {
        return room.memory.spawnQueue.shift();
    },

    peekFirstElementFromSpawnQueue(room) {
        return room.memory.spawnQueue[0];
    },

    searchUnoccupiedSpawnAndSpawnNewCreepWithArgs(spawns, args) {
        for(let i = 0; i < spawns.length; i++) {
            let spawn = spawns[i];
            if (spawn.spawning) {
                continue;
            }

            return this.spawnCreepWithArgs(spawn, args);
        }

        return ERR_BUSY;
    },

    spawnCreepWithArgs(spawn, args) {
        const energy = spawn.room.energyCapacityAvailable;

        switch (args.role) {
            case ROLE.BUILDER:
                return spawn.spawnWorker(args.role, energy);
            case ROLE.HARVESTER:
                return spawn.spawnHarvester(energy);
            case ROLE.HAULER:
                return spawn.spawnHauler(energy);
            case ROLE.UPGRADER:
                return spawn.spawnUpgrader(energy);
            case ROLE.REPAIRER:
                return spawn.spawnWorker(args.role, energy);
            case ROLE.REMOTE_WORKER:
                return spawn.spawnRemoteWorker(energy, args.targetRoomName, args.respawnTTL);
            case ROLE.REMOTE_HARVESTER:
                return spawn.spawnRemoteHarvester(energy, args.targetRoomName);
            case ROLE.REMOTE_HAULER:
                return spawn.spawnRemoteHauler(energy, args.targetRoomName);
            case ROLE.REMOTE_REPAIRER:
                return spawn.spawnRemoteRepairer(energy, args.repairRouteIndex);
            case ROLE.REMOTE_UPGRADER:
                return spawn.spawnRemoteUpgrader(energy, args.targetRoomName, args.respawnTTL);
            case ROLE.RESERVER:
                return spawn.spawnReserver(energy, args.targetRoomName);
            case ROLE.ATTACKER:
                return spawn.spawnAttacker(energy, args.targetRoomName);
            case ROLE.DEFENDER:
                return spawn.spawnDefender(energy, args.targetRoomName);
            case ROLE.CARRIER:
                return spawn.spawnCarrier(energy, args.targetRoomName, args.storageRoomName, args.respawnTTL);
            case ROLE.MINERAL_HARVESTER:
                return spawn.spawnMineralHarvester(energy);
            case ROLE.CLAIMER_ATTACKER:
                return spawn.spawnClaimerAttacker(energy, args.targetRoomName);
            case ROLE.EARLY_RCL_HARVESTER:
                return spawn.spawnEarlyRCLHarvester(energy);
            case ROLE.SCOUT:
                return spawn.spawnScout(energy);
            default:
                log.warning("Unknown role requested to spawn: " + args.role);
                return OK; // so it gets removed from our spawn queue
        }
    },

    isRoleNeeded(room, spawns, role) {
        // is said role already being spawned?
        for (let i = 0; i < spawns.length; i++) {
            if (spawns[i] && spawns[i].spawning && Memory.creeps[spawns[i].spawning.name].role === role) {
                return false;
            }
        }

        // is said role already registered in spawnQueue?
        if (!room.memory.spawnQueue) {
            room.memory.spawnQueue = [];
        }

        for (let args of room.memory.spawnQueue) {
            // TODO: This part seems to be never reached, check why
            if (args.role === role) {
                return false;
            }
        }

        let creepsWithRoleCount = this.countNumberOfCreepsWithRole(room, role);

        return creepsWithRoleCount < room.requestedCreeps[role];
    },

    countNumberOfCreepsWithRole(room, role) {
        const creeps = room.find(FIND_MY_CREEPS);
        return _.sum(creeps, creep => creep.role === role);
    },

    checkRemoteMiningRooms(room) {
        let remotes = room.remotes;

        if (!remotes || remotes.length === 0) {
            return;
        }

        if (this.searchRemoteWhichNeedsDefender(room) !== null) {
            return;
        }

        if (room.controller.level >= 3) {
            if (!room.memory.nextRemoteRepairerSpawn || room.memory.nextRemoteRepairerSpawn < Game.time) {
                room.addToSpawnQueueEnd({role: ROLE.REMOTE_REPAIRER});

                // TODO: Remove this once remote mining rooms are set up properly
                room.memory.repairRoute = room.remotes;

                room.memory.nextRemoteRepairerSpawn = utility.getFutureGameTimeWithRandomOffset(REMOTE_REPAIRER_SPAWN_INTERVAL, 200);
                return;
            }
        }

        for (let i = 0; i < remotes.length; i++) {
            let remoteMiningRoomMemory = Memory.rooms[remotes[i]];

            if (!remoteMiningRoomMemory) {
                continue;
            }

            if (remoteMiningRoomMemory.requiresHelp !== undefined) {
                continue;
            }

            if (!remoteMiningRoomMemory.sources) {
                if (Game.rooms[remotes[i]] !== undefined) {
                    Game.rooms[remotes[i]].initializeMemoryForAllSourcesInRoom();
                } else {
                    // no vision, claimer will be spawned later
                    continue;
                }
            }

            if (remoteMiningRoomMemory.assignedHarvesters < Object.keys(remoteMiningRoomMemory.sources).length) {
                room.addToSpawnQueueEnd({role: ROLE.REMOTE_HARVESTER, targetRoomName: remotes[i]});
                Memory.rooms[remotes[i]].assignedHarvesters++;
                return;
            }

            if (remoteMiningRoomMemory.requiredHaulers === undefined) {
                if (Game.rooms[remotes[i]]) {
                    room.calculateRequiredHaulersForRemote(room.name, remotes[i]);
                } else {
                    // no vision, don't calculate and don't spawn.
                }
            } else if (remoteMiningRoomMemory.assignedHaulers < this.calculateRequiredHaulers(room, remoteMiningRoomMemory)) {
                room.addToSpawnQueueEnd({role: ROLE.REMOTE_HAULER, targetRoomName: remotes[i]});
                Memory.rooms[remotes[i]].assignedHaulers++;
                return;
            }
        }

        if (room.energyCapacityAvailable < BODYPART_COST.claim + BODYPART_COST.move) {
            // TODO: Add a constant for minimum costs of certain creeps and use that instead
            return;
        }

        // Iterate reservers seperately
        for (let i = 0; i < remotes.length; i++) {
            let otherRoom = Game.rooms[remotes[i]];

            if (otherRoom && otherRoom.controller.reservation && otherRoom.controller.reservation.ticksToEnd > 1000) {
                continue;
            }

            let remoteMiningRoomMemory = Memory.rooms[remotes[i]];

            if (!remoteMiningRoomMemory.isReserverAssigned && room.energyCapacityAvailable >= 650) {
                room.addToSpawnQueueEnd({role: ROLE.RESERVER, targetRoomName: remotes[i]});
                Memory.rooms[remotes[i]].isReserverAssigned = true;
                return;
            }
        }
    },

    calculateRequiredHaulers(room, remoteMiningRoomMemory) {
        return remoteMiningRoomMemory.requiredHaulers * this.calculateRequiredHaulerFactor(room);
    },

    calculateRequiredHaulerFactor(room) {
        // 2500E for full hauler
        // Below 550E
        switch (room.controller.level) {
            case 1: // 300E, 2W Harvesters
                return 2;
            case 2:
                switch (room.extensions.length) {
                    case 0:
                        return 2;
                    case 1:  // 350E, 3W Harvesters
                        return 3;
                    case 2:  // 400E
                        return 2.75;
                    case 3:  // 450E, 4W Harvesters
                        return 2.5;
                    case 4:  // 500E
                        return 2.25;
                    default: // 550E, 5W harvesters
                        return 2.75;
                }
            case 3:
                switch (room.extensions.length) {
                    case 5:  // 550E
                        return 2.75;
                    case 6:  // 600E
                        return 2;
                    case 7:  // 650E, Claimers are now available -> energy output is doubled!
                    case 8:  // 700E
                        return 3.5;
                    case 9:  // 750E
                    default: // 800E
                        return 3;
                }
            case 4:
                switch (room.extensions.length) {
                    case 10: // 800E
                        return 3;
                    case 11: // 850E
                    case 12: // 900E
                    case 13: // 950E
                    case 14: // 1000E
                        return 2.5;
                    case 15: // 1050E
                    case 16: // 1100E
                    case 17: // 1150E
                    case 18: // 1200E
                    case 19: // 1250E
                    default: // 1300E
                        return 2;
                }
            case 5:
                switch (room.extensions.length) {
                    case 20: // 1300E
                        return 2;
                    case 21: // 1350E
                    case 22: // 1400E
                    case 23: // 1450E
                    case 24: // 1500E
                    case 25: // 1550E
                        return 2.5;
                    case 26: // 1600E
                    case 27: // 1650E
                    case 28: // 1700E
                    case 29: // 1750E
                    default: // 1800E
                        return 1.3;
                }
            default: // Full 50 Part-Haulers!
                return 1;
        }
    },

    isDefenderNeeded(roomName) {
        return Memory.rooms[roomName] && Memory.rooms[roomName].requiresHelp;
    },

    searchRemoteWhichNeedsDefender(room) {
        let remotes = room.remotes;

        if (!remotes || remotes.length === 0) {
            return null;
        }

        for (let i = 0; i < remotes.length; i++) {
            const remoteRoomName = remotes[i];
            if (this.isDefenderNeeded(remoteRoomName)) {
                return remoteRoomName;
            }
        }

        return null;
    },

    addDefenderToSpawnQueue(spawnRoom, targetRoomName) {
        Memory.rooms[targetRoomName].requiresHelp = false;
        spawnRoom.addToSpawnQueueStart({role: ROLE.DEFENDER, targetRoomName: targetRoomName});
    },

    checkIfRoomIsAliveAndReviveIfNecessary(room) {
        if (room.find(FIND_MY_CREEPS).length > 0) {
            return false;
        }

        for (let spawn of room.mySpawns) {
            if (spawn.spawning) {
                return false;
            }
        }

        log.warning(room + "just died! Trying to revive it...");
        if (room.storage && room.storage.store[RESOURCE_ENERGY] > 5000) {
            room.mySpawns[0].spawnHauler(room.energyAvailable);
            return true;
        }

        if (room.terminal && room.terminal.store[RESOURCE_ENERGY] > 5000) {
            room.mySpawns[0].spawnHauler(room.energyAvailable);
            return true;
        }

        room.mySpawns[0].spawnEarlyRCLHarvester(room.energyAvailable);
        return true;
    }
};

profiler.registerObject(spawnlogic, "SpawnLogic");
module.exports = spawnlogic;