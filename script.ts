const AI_NUM = 24;
const PLAYER_MOVE_SPEED_MULTI = 10;
const AI_MAX_HEALTH = 1;
const PLAYER_MAX_HEALTH = 1000;
let spawnerID = Array.from({ length: AI_NUM }, (_, i) => i + 1);

export async function OnGameModeStarted() {
  mod.EnableHQ(mod.GetHQ(1), true);

  // First spawn
  spawnerID.forEach((spawnerID) => {
    spawnAI(mod.GetSpawner(spawnerID));
  });
}

export function OnPlayerDied(player: mod.Player): void {
  if (isAI(player)) {
    let id = mod.GetObjId(player);
    let deadAI = SrSoldier.getByPlayer(player);
    if (deadAI) {
      spawnAI(deadAI.spawner);
      SrSoldier.removeDeadAI(id);
    }
  }
}

export function OnPlayerFired(player: mod.Player): void {
  if (!isAI(player)) {
    giveInfiniteAmmo(player);
  }
}

export function OnSpawnerSpawned(
  player: mod.Player,
  spawner: mod.Spawner
): void {
  if (isAI(player)) {
    let srSoldier = SrSoldier.get(player, spawner);
    if (srSoldier) {
      srSoldier.setAIState();
    }
  } else return;
}


export function OnPlayerSpawned(player: mod.Player): void {
  if (isAI(player)) {
    mod.AIEnableTargeting(player, false);
    mod.AIEnableShooting(player, false);
    mod.AIIdleBehavior(player);
    mod.SetPlayerMaxHealth(player, AI_MAX_HEALTH);
  } else { // is player
    mod.SetPlayerMovementSpeedMultiplier(player, PLAYER_MOVE_SPEED_MULTI);
    mod.SetPlayerMaxHealth(player, PLAYER_MAX_HEALTH);
  }
}

class SrSoldier {
  player: mod.Player;
  playerId: number;
  spawner: mod.Spawner;
  shouldRandomStance: boolean = false;

  static #allSrSoldiers: { [id: number]: SrSoldier } = {};
  constructor(player: mod.Player, spawner: mod.Spawner) {
    this.player = player;
    this.playerId = mod.GetObjId(player);
    this.spawner = spawner;
  }

  setAIState(): void {
    let player = this.player;
    mod.AIEnableTargeting(player, false);
    mod.AIEnableShooting(player, false);
    mod.AIIdleBehavior(player);
    mod.SetPlayerMaxHealth(player, AI_MAX_HEALTH);
  }

  static get(player: mod.Player, spawner: mod.Spawner): SrSoldier | undefined {
    if (mod.GetObjId(player) > -1) {
      let index = mod.GetObjId(player);

      let srSoldier = this.#allSrSoldiers[index];
      if (!srSoldier) {
        srSoldier = new SrSoldier(player, spawner);
        this.#allSrSoldiers[index] = srSoldier;
      }
      return srSoldier;
    }
    return undefined;
  }

  static getByPlayer(player: mod.Player): SrSoldier | undefined {
    const id = mod.GetObjId(player);
    return SrSoldier.#allSrSoldiers[id];
  }

  static removeDeadAI(id: number): void {
    delete this.#allSrSoldiers[id];
  }
}

function spawnAI(spawner: mod.Spawner): void {
  mod.SpawnAIFromAISpawner(spawner, mod.SoldierClass.Assault, mod.GetTeam(2));
}

function isAI(player: mod.Player): boolean {
  return mod.GetSoldierState(player, mod.SoldierStateBool.IsAISoldier);
}

function giveInfiniteAmmo(player: mod.Player): void {
  for (let slot of [
    mod.InventorySlots.PrimaryWeapon,
    mod.InventorySlots.SecondaryWeapon,
    mod.InventorySlots.Throwable,
    mod.InventorySlots.GadgetOne,
    mod.InventorySlots.GadgetTwo,
  ]) {
    mod.SetInventoryAmmo(player, slot, 9999);          
    mod.SetInventoryMagazineAmmo(player, slot, 999);
  }
}


// TODO

// SetVehicleSpawnerAutoSpawn
// SetInventoryAmmo
// SetInventoryMagazineAmmo
// InventorySlots
// GetInventoryAmmo