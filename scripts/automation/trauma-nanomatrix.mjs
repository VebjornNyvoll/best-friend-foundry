import { getSelectedActor, getFlag, setFlag, sendAbilityCard } from "../utils.mjs";

/**
 * Activate Trauma Response Nanomatrix.
 * Once per day, as an Action, repair Skinweave or Subdermal Armor to full SP.
 * Each additional installation increases daily uses by 1.
 * @param {object} [context] - Chat card button context
 */
export async function onTraumaNanomatrix(context = {}) {
  const actor = context.actorId
    ? game.actors.get(context.actorId)
    : getSelectedActor();

  if (!actor) {
    ui.notifications.warn("Select a token with Trauma Response Nanomatrix first.");
    return;
  }

  // Check daily usage (keyed by in-game day or session)
  const usedToday = getFlag(actor, "nanomatrixUsedToday") ?? false;

  if (usedToday) {
    ui.notifications.warn(game.i18n.localize("CPRED_BF.chat.alreadyUsedToday"));
    return;
  }

  // Find Skinweave or Subdermal Armor cyberware items
  const armorItems = actor.items.filter((i) => {
    const n = i.name.toLowerCase();
    return (n.includes("skinweave") || n.includes("subdermal armor") || n.includes("hardened shell")) &&
      (i.type === "cyberware" || i.type === "armor");
  });

  if (armorItems.length === 0) {
    ui.notifications.warn("No Skinweave or Subdermal Armor found on this actor.");
    return;
  }

  // Restore each armor to full SP
  const restoredItems = [];
  for (const item of armorItems) {
    const updates = {};

    // Reset body SP to max
    if (item.system?.bodyLocation) {
      const maxSP = item.system.bodyLocation.maxSp ?? item.system.bodyLocation.sp ?? 0;
      updates["system.bodyLocation.sp"] = maxSP;
      if (item.system.bodyLocation.ablation !== undefined) {
        updates["system.bodyLocation.ablation"] = 0;
      }
    }

    // Reset head SP to max
    if (item.system?.headLocation) {
      const maxSP = item.system.headLocation.maxSp ?? item.system.headLocation.sp ?? 0;
      updates["system.headLocation.sp"] = maxSP;
      if (item.system.headLocation.ablation !== undefined) {
        updates["system.headLocation.ablation"] = 0;
      }
    }

    if (Object.keys(updates).length > 0) {
      await item.update(updates);
      restoredItems.push(item.name);
    }
  }

  // Mark as used
  await setFlag(actor, "nanomatrixUsedToday", true);

  await sendAbilityCard("ability-card.hbs", {
    actorName: actor.name,
    actorImg: actor.img,
    abilityName: game.i18n.localize("CPRED_BF.abilities.traumaNanomatrix"),
    description: game.i18n.localize("CPRED_BF.abilities.traumaNanomatrix.desc"),
    result: `${game.i18n.localize("CPRED_BF.chat.armorRestored")} Restored: ${restoredItems.join(", ")}`,
    success: true,
  }, {
    speaker: ChatMessage.getSpeaker({ actor }),
  });
}
