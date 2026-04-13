import { getSelectedActor, getFlag, setFlag, unsetFlag, sendAbilityCard } from "../utils.mjs";

/**
 * Activate Trauma Response Nanomatrix.
 * Once per day, as an Action, repair Skinweave or Subdermal Armor to full SP.
 */
export async function onTraumaNanomatrix(context = {}) {
  const actor = context.actorId
    ? game.actors.get(context.actorId)
    : getSelectedActor();

  if (!actor) {
    ui.notifications.warn("Select a token with Trauma Response Nanomatrix first.");
    return;
  }

  // Check daily usage
  const usedToday = getFlag(actor, "nanomatrixUsedToday") ?? false;

  if (usedToday) {
    ui.notifications.warn("Trauma Response Nanomatrix has already been used today.");
    // Show card with reset button for GM
    await sendAbilityCard("ability-card.hbs", {
      actorName: actor.name,
      actorImg: actor.img,
      abilityName: "Trauma Response Nanomatrix",
      result: "Already used today. GM can reset daily uses below.",
      showReset: true,
      actorId: actor.id,
    }, {
      speaker: ChatMessage.getSpeaker({ actor }),
    });
    return;
  }

  // Find Skinweave or Subdermal Armor items
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

    if (item.system?.bodyLocation) {
      const maxSP = item.system.bodyLocation.maxSp ?? item.system.bodyLocation.sp ?? 0;
      updates["system.bodyLocation.sp"] = maxSP;
      if (item.system.bodyLocation.ablation !== undefined) {
        updates["system.bodyLocation.ablation"] = 0;
      }
    }

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
    abilityName: "Trauma Response Nanomatrix",
    description: "Repairs Skinweave or Subdermal Armor to full SP. Once per day as an Action.",
    result: `Armor restored to full SP: ${restoredItems.join(", ")}`,
    success: true,
    showReset: true,
    actorId: actor.id,
  }, {
    speaker: ChatMessage.getSpeaker({ actor }),
  });
}

/**
 * Reset the daily Nanomatrix usage (GM action).
 */
export async function onNanomatrixReset(context = {}) {
  const actor = context.actorId
    ? game.actors.get(context.actorId)
    : getSelectedActor();

  if (!actor) return;

  await unsetFlag(actor, "nanomatrixUsedToday");

  await ChatMessage.create({
    content: `<div class="cpred-bf-card">
      <div class="card-body">
        <p><strong>${actor.name}</strong>'s Trauma Response Nanomatrix daily uses have been reset.</p>
      </div>
    </div>`,
    speaker: ChatMessage.getSpeaker({ actor }),
  });
}
