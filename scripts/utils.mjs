const MODULE_ID = "cpred-best-friend";

// ── Actor / Token Helpers ───────────────────────────────────────────

/**
 * Get the selected actor from canvas tokens or the user's character.
 * @returns {Actor|null}
 */
export function getSelectedActor() {
  const token = canvas.tokens?.controlled?.[0];
  if (token?.actor) return token.actor;
  return game.user.character ?? null;
}

/**
 * Get targeted tokens.
 * @returns {Token[]}
 */
export function getTargetedTokens() {
  return Array.from(game.user.targets);
}

/**
 * Get the first targeted actor.
 * @returns {Actor|null}
 */
export function getTargetedActor() {
  const targets = getTargetedTokens();
  return targets[0]?.actor ?? null;
}

// ── CPR-Compatible Roll Helpers ─────────────────────────────────────

/**
 * Roll 1d10 with CPR critical handling.
 * - Natural 10: roll another d10, ADD to total (critical success)
 * - Natural 1: roll another d10, SUBTRACT from total (critical failure)
 *
 * Roll objects are collected in the `_rolls` array. Pass them to
 * sendAbilityCard() so Dice So Nice picks them up from the ChatMessage
 * automatically — no manual showForRoll needed.
 *
 * @returns {Promise<{total: number, initialRoll: number, critRoll: number,
 *   isCritSuccess: boolean, isCritFail: boolean, _rolls: Roll[]}>}
 */
export async function cprRoll() {
  const baseRoll = await new Roll("1d10").evaluate();
  const rolls = [baseRoll];
  const initialRoll = baseRoll.total;

  let critRoll = 0;
  let isCritSuccess = false;
  let isCritFail = false;

  if (initialRoll === 10) {
    isCritSuccess = true;
    const extra = await new Roll("1d10").evaluate();
    rolls.push(extra);
    critRoll = extra.total;
  } else if (initialRoll === 1) {
    isCritFail = true;
    const extra = await new Roll("1d10").evaluate();
    rolls.push(extra);
    critRoll = extra.total;
  }

  // Crit success adds, crit fail subtracts
  const total = isCritFail
    ? initialRoll - critRoll
    : initialRoll + critRoll;

  return { total, initialRoll, critRoll, isCritSuccess, isCritFail, _rolls: rolls };
}

/**
 * Perform a CPR skill check: d10 (with crits) + stat + skill.
 *
 * @param {Actor} actor - The acting actor
 * @param {string} statKey - Key in actor.system.stats (e.g. "dex", "will", "cool")
 * @param {string} skillName - Skill name to find in actor's items (partial match, case-insensitive)
 * @returns {Promise<{total: number, statValue: number, skillLevel: number,
 *   statKey: string, skillName: string, roll: object, success: boolean, dv: number|null}>}
 */
export async function cprSkillCheck(actor, statKey, skillName) {
  const statValue = actor.system?.stats?.[statKey]?.value ?? 0;

  const skillItem = actor.items.find(
    (i) => i.type === "skill" && i.name.toLowerCase().includes(skillName.toLowerCase())
  );
  const skillLevel = skillItem?.system?.level ?? 0;

  const roll = await cprRoll();
  const total = roll.total + statValue + skillLevel;

  return {
    total,
    statValue,
    skillLevel,
    statKey,
    skillName: skillItem?.name ?? skillName,
    roll,
    _rolls: roll._rolls,
    success: null,
    dv: null,
  };
}

/**
 * Perform a CPR attack roll: d10 (with crits) + flat combat number.
 *
 * @param {number} combatNumber - The weapon/ability combat number
 * @returns {Promise<{total: number, combatNumber: number, roll: object}>}
 */
export async function cprAttackRoll(combatNumber) {
  const roll = await cprRoll();
  const total = roll.total + combatNumber;
  return { total, combatNumber, roll, _rolls: roll._rolls };
}

/**
 * Roll damage dice (no crit handling — CPR damage doesn't crit).
 *
 * @param {string} formula - Dice formula like "3d6" or "1d6"
 * @returns {Promise<{total: number, formula: string, result: string}>}
 */
export async function cprDamageRoll(formula) {
  const roll = await new Roll(formula).evaluate();
  return { total: roll.total, formula, result: roll.result, _rolls: [roll] };
}

/**
 * Apply damage directly to an actor's HP.
 *
 * @param {Actor} actor - Target actor
 * @param {number} amount - Damage to deal
 * @returns {Promise<{oldHP: number, newHP: number}>}
 */
export async function applyHPDamage(actor, amount) {
  const oldHP = actor.system?.derivedStats?.hp?.value ?? 0;
  const newHP = Math.max(0, oldHP - amount);
  await actor.update({ "system.derivedStats.hp.value": newHP });
  return { oldHP, newHP };
}

// ── Flag Helpers ────────────────────────────────────────────────────

/**
 * Get a flag value from an actor.
 * @param {Actor} actor
 * @param {string} key
 * @returns {*}
 */
export function getFlag(actor, key) {
  return actor.getFlag(MODULE_ID, key);
}

/**
 * Set a flag value on an actor.
 * @param {Actor} actor
 * @param {string} key
 * @param {*} value
 */
export async function setFlag(actor, key, value) {
  return actor.setFlag(MODULE_ID, key, value);
}

/**
 * Remove a flag from an actor.
 * @param {Actor} actor
 * @param {string} key
 */
export async function unsetFlag(actor, key) {
  return actor.unsetFlag(MODULE_ID, key);
}

// ── Combat / Measurement Helpers ────────────────────────────────────

/**
 * Get the current combat round, or null if no combat.
 * @returns {number|null}
 */
export function getCurrentRound() {
  return game.combat?.round ?? null;
}

/**
 * Measure the distance between two tokens on the canvas.
 * @param {Token} tokenA
 * @param {Token} tokenB
 * @returns {number} Distance in grid units (m/yds)
 */
export function measureDistance(tokenA, tokenB) {
  const ray = new Ray(tokenA.center, tokenB.center);
  return canvas.grid.measureDistances([{ ray }], { gridSpaces: true })[0];
}

// ── Armor Helpers ───────────────────────────────────────────────────

/**
 * Find all equipped armor items on an actor.
 * @param {Actor} actor
 * @returns {Item[]}
 */
export function getEquippedArmor(actor) {
  return actor.items.filter(
    (i) => i.type === "armor" && i.system?.isEquipped !== false
  );
}

// ── Chat Card Helpers ───────────────────────────────────────────────

/**
 * Format a CPR roll result for display in chat cards.
 * Returns an object with pre-formatted display strings.
 *
 * @param {object} roll - Result from cprRoll()
 * @param {object} [opts] - Optional stat/skill info
 * @returns {object} Display-ready roll data
 */
export function formatRollDisplay(roll, opts = {}) {
  const parts = [];
  if (opts.statKey) parts.push(`${opts.statKey.toUpperCase()} ${opts.statValue}`);
  if (opts.skillName) parts.push(`${opts.skillName} ${opts.skillLevel}`);

  let dieText = `d10 [${roll.initialRoll}]`;
  if (roll.isCritSuccess) dieText += ` + d10 [${roll.critRoll}]`;
  if (roll.isCritFail) dieText += ` − d10 [${roll.critRoll}]`;
  parts.push(dieText);

  return {
    breakdown: parts.join(" + "),
    dieResult: roll.initialRoll,
    critRoll: roll.critRoll,
    isCritSuccess: roll.isCritSuccess,
    isCritFail: roll.isCritFail,
    isCrit: roll.isCritSuccess || roll.isCritFail,
  };
}

/**
 * Create and send a module chat message using a Handlebars template.
 * @param {string} template - Template filename (relative to module templates/chat/)
 * @param {object} data - Template data
 * @param {object} [options] - ChatMessage creation options
 * @returns {Promise<ChatMessage>}
 */
export async function sendAbilityCard(template, data, options = {}) {
  const content = await renderTemplate(
    `modules/${MODULE_ID}/templates/chat/${template}`,
    data
  );

  // Collect Roll objects so Dice So Nice animates them from the ChatMessage
  const rolls = options.rolls ?? [];

  return ChatMessage.create({
    content,
    rolls,
    speaker: options.speaker ?? ChatMessage.getSpeaker(),
    ...options,
  });
}
