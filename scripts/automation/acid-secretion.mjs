import { getSelectedActor, getTargetedActor, cprAttackRoll, formatRollDisplay, sendAbilityCard } from "../utils.mjs";

/**
 * Activate the Neon Newt's Acid Secretion ability.
 * On a successful attack, lowers the SP of all worn armor on the target by 1.
 * Does not deal damage itself. Combat Number 5.
 */
export async function onAcidSecretion(context = {}) {
  const actor = context.actorId
    ? game.actors.get(context.actorId)
    : getSelectedActor();

  if (!actor) {
    ui.notifications.warn("Select a Neon Newt token first.");
    return;
  }

  const target = context.targetId
    ? game.actors.get(context.targetId)
    : getTargetedActor();

  if (!target) {
    ui.notifications.warn("Target a token to apply Acid Secretion.");
    return;
  }

  // Attack roll: d10 (with crits) + Combat Number 5
  const attack = await cprAttackRoll(5);
  const attackDisplay = formatRollDisplay(attack.roll);

  // GM compares attack total to target's evasion — we display the result
  // and provide a button/note. For simplicity, we show the total and let
  // the GM confirm the hit, but also auto-apply the SP reduction since
  // the macro is explicitly triggered on a hit.
  // The card shows the roll so the GM can adjudicate.

  // Find all equipped armor on the target and reduce SP by 1
  const armorUpdates = [];
  for (const item of target.items) {
    if (item.type === "armor" && item.system?.isEquipped) {
      const updates = {};
      if (item.system.bodyLocation?.sp > 0) {
        updates["system.bodyLocation.sp"] = item.system.bodyLocation.sp - 1;
      }
      if (item.system.headLocation?.sp > 0) {
        updates["system.headLocation.sp"] = item.system.headLocation.sp - 1;
      }
      if (Object.keys(updates).length > 0) {
        armorUpdates.push({ item, updates });
      }
    }
  }

  // Apply SP reductions
  for (const { item, updates } of armorUpdates) {
    await item.update(updates);
  }

  const armorNames = armorUpdates.map(({ item }) => item.name).join(", ");

  await sendAbilityCard("ability-card.hbs", {
    actorName: actor.name,
    actorImg: actor.img,
    targetName: target.name,
    abilityName: "Acid Secretion",
    description: "On a successful attack, the acid lowers the SP of all worn armor on the target by 1. It does not deal damage.",
    attackTotal: attack.total,
    attackBreakdown: `Combat Number 5 + ${attackDisplay.breakdown} = ${attack.total}`,
    attackDieResult: attackDisplay.dieResult,
    attackCritSuccess: attack.roll.isCritSuccess,
    attackCritFail: attack.roll.isCritFail,
    result: armorUpdates.length > 0
      ? `Acid reduced SP by 1 on: ${armorNames}`
      : "No armor to degrade.",
  }, {
    speaker: ChatMessage.getSpeaker({ actor }),
  });
}
