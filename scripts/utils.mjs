const MODULE_ID = "cpred-best-friend";

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

/**
 * Roll a stat + skill check against a DV.
 * @param {number} statValue - The stat value
 * @param {number} skillValue - The skill level
 * @param {number} dv - The difficulty value
 * @returns {Promise<{roll: Roll, total: number, success: boolean}>}
 */
export async function rollDVCheck(statValue, skillValue, dv) {
  const roll = new Roll("1d10 + @stat + @skill", { stat: statValue, skill: skillValue });
  await roll.evaluate();
  return {
    roll,
    total: roll.total,
    success: roll.total >= dv,
  };
}

/**
 * Roll damage dice.
 * @param {string} formula - Dice formula like "2d6" or "1d6"
 * @returns {Promise<{roll: Roll, total: number}>}
 */
export async function rollDamage(formula) {
  const roll = new Roll(formula);
  await roll.evaluate();
  return { roll, total: roll.total };
}

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

/**
 * Find all equipped armor items on an actor.
 * @param {Actor} actor
 * @returns {Item[]}
 */
export function getEquippedArmor(actor) {
  return actor.items.filter(
    (i) => (i.type === "armor" || i.type === "cyberware") &&
      i.system?.isEquipped !== false
  );
}

/**
 * Create and send a module chat message using a Handlebars template.
 * @param {string} template - Template path relative to module
 * @param {object} data - Template data
 * @param {object} [options] - ChatMessage creation options
 * @returns {Promise<ChatMessage>}
 */
export async function sendAbilityCard(template, data, options = {}) {
  const content = await renderTemplate(
    `modules/${MODULE_ID}/templates/chat/${template}`,
    data
  );
  return ChatMessage.create({
    content,
    speaker: options.speaker ?? ChatMessage.getSpeaker(),
    ...options,
  });
}
