import { getSelectedActor, getCurrentRound, getFlag, setFlag, rollDamage, sendAbilityCard } from "../utils.mjs";

/**
 * Activate the Neon Newt's Flamebreath ability.
 * Acts like a Flamethrower (CP:R page 348). Cannot be used two turns in a row.
 * @param {object} [context] - Chat card button context
 */
export async function onFlamebreath(context = {}) {
  const actor = context.actorId
    ? game.actors.get(context.actorId)
    : getSelectedActor();

  if (!actor) {
    ui.notifications.warn("Select a Neon Newt token first.");
    return;
  }

  const currentRound = getCurrentRound();
  const lastUsed = getFlag(actor, "lastFlamebreath");

  // Check cooldown: cannot use if used in the previous round
  if (currentRound !== null && lastUsed !== undefined && currentRound - lastUsed <= 1) {
    ui.notifications.warn(game.i18n.localize("CPRED_BF.chat.cooldownActive"));
    return;
  }

  // Roll the attack: Combat Number 8 (1d10 + 8)
  const attackRoll = new Roll("1d10 + 8");
  await attackRoll.evaluate();

  // Roll damage: 1d6 (Flamebreath damage)
  const { roll: damageRoll, total: damageTotal } = await rollDamage("1d6");

  // Track cooldown
  if (currentRound !== null) {
    await setFlag(actor, "lastFlamebreath", currentRound);
  }

  // Send chat card
  await sendAbilityCard("flamebreath-card.hbs", {
    actorName: actor.name,
    actorImg: actor.img,
    attackTotal: attackRoll.total,
    attackRoll: attackRoll.result,
    damageTotal,
    damageRoll: damageRoll.result,
    description: game.i18n.localize("CPRED_BF.abilities.flamebreath.desc"),
    note: "Flamebreath acts as a Flamethrower. If the target is hit, they must attempt to put out the fire or continue to burn (see CP:R page 180).",
  }, {
    speaker: ChatMessage.getSpeaker({ actor }),
  });
}
