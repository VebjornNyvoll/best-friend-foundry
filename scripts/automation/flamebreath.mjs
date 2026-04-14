import { getSelectedActor, getCurrentRound, getFlag, setFlag, cprAttackRoll, cprDamageRoll, formatRollDisplay, sendAbilityCard } from "../utils.mjs";

/**
 * Activate the Neon Newt's Flamebreath ability.
 * Acts like a Flamethrower (CP:R page 348). Cannot be used two turns in a row.
 * Combat Number 8, Damage 1d6.
 */
export async function onFlamebreath(context = {}) {
  const actor = context.actorId
    ? game.actors.get(context.actorId)
    : getSelectedActor();

  if (!actor) {
    ui.notifications.warn("Select a Neon Newt token first.");
    return;
  }

  // Cooldown check: cannot use if used in the previous round
  const currentRound = getCurrentRound();
  const lastUsed = getFlag(actor, "lastFlamebreath");
  if (currentRound !== null && lastUsed !== undefined && currentRound - lastUsed <= 1) {
    ui.notifications.warn("Flamebreath is on cooldown! It cannot be used two turns in a row.");
    return;
  }

  // Attack roll: d10 (with crits) + Combat Number 8
  const attack = await cprAttackRoll(8);
  const attackDisplay = formatRollDisplay(attack.roll);

  // Damage roll: 1d6
  const damage = await cprDamageRoll("1d6");

  // Track cooldown
  if (currentRound !== null) {
    await setFlag(actor, "lastFlamebreath", currentRound);
  }

  await sendAbilityCard("ability-card.hbs", {
    actorName: actor.name,
    actorImg: actor.img,
    abilityName: "Flamebreath",
    description: "Acts as a Flamethrower. If the target is hit, they must attempt to put out the fire or continue to burn (CP:R p.180).",
    attackTotal: attack.total,
    attackBreakdown: `Combat Number 8 + ${attackDisplay.breakdown} = ${attack.total}`,
    attackDieResult: attackDisplay.dieResult,
    attackCritSuccess: attack.roll.isCritSuccess,
    attackCritFail: attack.roll.isCritFail,
    damageTotal: damage.total,
    damageFormula: damage.result,
  }, {
    speaker: ChatMessage.getSpeaker({ actor }),
    rolls: [...attack._rolls, ...damage._rolls],
  });
}
