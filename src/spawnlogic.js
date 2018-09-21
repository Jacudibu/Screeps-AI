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
            this.checkAndSpawnDefenderIfNecessary(room);
            this.checkRemoteMiningRoomsAndSpawnDefenderIfNecessary(room);
        }

        // If something was added the spawnqueue was changed
        if (!room.isSpawnQueueEmpty()) {
            if (this.searchUnoccupiedSpawnAndSpawnNewCreepWithArgs(spawns, this.peekFirstElementFromSpawnQueue(room)) === OK) {
                this.shiftElementFromSpawnQueue(room);
            }
        }

        room.memory.allowEnergyCollection = room.isSpawnQueueEmpty() && !room.storage;
    },

    checkAndSpawnDefenderIfNecessary(room) {
        if (room.memory.requiresHelp) {
            room.memory.requiresHelp = false;
            room.addToSpawnQueueStart({role: ROLE.DEFENDER, targetRoomName: room.name});
            return true;
        }

        if (room.myTowers.length > 0) {
            return false;
        }

        if (room.find(FIND_HOSTILE_CREEPS).length > 0) {
            if (room.find(FIND_MY_CREEPS, {filter: creep => creep.memory.role === ROLE.ATTACKER}).length === 0) {
                // Shoo scouts away, so they don't block construction sites.
                room.addToSpawnQueueStart({role: ROLE.ATTACKER});
                return true;
            }
        }

        return false;
    },

    tryAddingNewCreepToSpawnQueue(room, spawns) {
        if (room.memory.requestedCreeps === undefined) {
            room.updateRequestedCreeps();
        }

        if (room.energyCapacityAvailable < 550) {
            // Early RCL. CUUUUTE!
            if (this.isRoleNeeded(room, spawns, ROLE.EARLY_RCL_HARVESTER)) {
                room.addToSpawnQueueStart({role: ROLE.EARLY_RCL_HARVESTER});
                return;
            }

            if (this.checkAndSpawnDefenderIfNecessary(room)) {
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

            if (this.checkAndSpawnDefenderIfNecessary(room)) {
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
            case ROLE.REMOTE_REPAIRER_V2:
                return spawn.spawnRemoteRepairerV2(energy, args.repairRouteIndex);
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
            default:
                log.warning("Unknown role requested to spawn: " + args.role);
                return OK; // so it gets removed from our spawn queue
        }
    },

    isRoleNeeded(room, spawns, role) {
        // is said role already being spawned?
        for (let i = 0; i < spawns.length; i++) {
            if (spawns[i].spawning && Memory.creeps[spawns[i].spawning.name].role === role) {
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

        return creepsWithRoleCount < room.memory.requestedCreeps[role];
    },

    countNumberOfCreepsWithRole(room, role) {
        let creeps = room.find(FIND_MY_CREEPS);
        return _.sum(creeps, creep => creep.memory.role === role);
    },

    checkRemoteMiningRooms(room) {
        let remoteMiningRoomList = room.memory.remoteMiningRooms;

        if (!remoteMiningRoomList || remoteMiningRoomList.length === 0) {
            return;
        }

        if (this.checkRemoteMiningRoomsAndSpawnDefenderIfNecessary(room)) {
            return;
        }

        if (!room.memory.nextRemoteRepairerSpawn || room.memory.nextRemoteRepairerSpawn < Game.time) {
            room.addToSpawnQueueEnd({role: ROLE.REMOTE_REPAIRER});
            room.memory.repairRoute = room.memory.remoteMiningRooms;
            room.memory.nextRemoteRepairerSpawn = utility.getFutureGameTimeWithRandomOffset(REMOTE_REPAIRER_SPAWN_INTERVAL, 200);
            return;
        }

        for (let i = 0; i < remoteMiningRoomList.length; i++) {
            let remoteMiningRoomMemory = Memory.rooms[remoteMiningRoomList[i]];

            if (remoteMiningRoomMemory.requiresHelp !== undefined) {
                continue;
            }

            if (!remoteMiningRoomMemory.sources) {
                if (Game.rooms[remoteMiningRoomList[i]] !== undefined) {
                    Game.rooms[remoteMiningRoomList[i]].initializeMemoryForAllSourcesInRoom();
                } else {
                    log.info(room + " ---> " + remoteMiningRoomList[i] + "|no vision to set up remote mining room source memory at index " + i);
                    continue;
                }
            }

            if (remoteMiningRoomMemory.assignedHarvesters < Object.keys(remoteMiningRoomMemory.sources).length) {
                room.addToSpawnQueueEnd({role: ROLE.REMOTE_HARVESTER, targetRoomName: remoteMiningRoomList[i]});
                Memory.rooms[remoteMiningRoomList[i]].assignedHarvesters++;
                return;
            }

            if (remoteMiningRoomMemory.assignedHaulers < remoteMiningRoomMemory.requiredHaulers) {
                room.addToSpawnQueueEnd({role: ROLE.REMOTE_HAULER, targetRoomName: remoteMiningRoomList[i]});
                Memory.rooms[remoteMiningRoomList[i]].assignedHaulers++;
                return;
            }
        }

        // Iterate reservers seperately
        for (let i = 0; i < remoteMiningRoomList.length; i++) {
            let otherRoom = Game.rooms[remoteMiningRoomList[i]];

            if (otherRoom && otherRoom.controller.reservation && otherRoom.controller.reservation.ticksToEnd > 1000) {
                continue;
            }

            let remoteMiningRoomMemory = Memory.rooms[remoteMiningRoomList[i]];
            if (!remoteMiningRoomMemory.isReserverAssigned && room.energyCapacityAvailable >= 650) {
                room.addToSpawnQueueEnd({role: ROLE.RESERVER, targetRoomName: remoteMiningRoomList[i]});
                Memory.rooms[remoteMiningRoomList[i]].isReserverAssigned = true;
                return;
            }
        }
    },

    checkRemoteMiningRoomsAndSpawnDefenderIfNecessary(room) {
        let remoteMiningRooms = room.memory.remoteMiningRooms;

        if (!remoteMiningRooms || remoteMiningRooms.length === 0) {
            return false;
        }

        for (let i = 0; i < remoteMiningRooms.length; i++) {
            let remoteMiningRoom = Memory.rooms[remoteMiningRooms[i]];
            if (remoteMiningRoom.requiresHelp === true) {
                room.addToSpawnQueueStart({role: ROLE.DEFENDER, targetRoomName: remoteMiningRooms[i]});
                Memory.rooms[remoteMiningRooms[i]].requiresHelp = false;
                return true;
            }
        }

        return false;
    },
};

profiler.registerObject(spawnlogic, "SpawnLogic");
module.exports = spawnlogic;