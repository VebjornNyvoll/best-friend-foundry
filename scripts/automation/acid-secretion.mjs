import { getSelectedActor, getTargetedActor, sendAbilityCard } from "../utils.mjs";

/**
 * Activate the Neon Newt's Acid Secretion ability.
 * On a successful attack, lowers the SP of all worn armor on the target by 1.
 * Does not deal damage itself.
 * @param {object} [context] - Chat card button context
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

  // Roll the attack: Combat Number 5 (1d10 + 5)
  const attackRoll = new Roll("1d10 + 5");
  await attackRoll.evaluate();

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
    abilityName: game.i18n.localize("CPRED_BF.abilities.acidSecretion"),
    description: game.i18n.localize("CPRED_BF.abilities.acidSecretion.desc"),
    attackTotal: attackRoll.total,
    attackRoll: attackRoll.result,
    result: armorUpdates.length > 0
      ? `Acid reduced SP by 1 on: ${armorNames}`
      : "No armor to degrade.",
    targetName: target.name,
  }, {
    speaker: ChatMessage.getSpeaker({ actor }),
  });
}
