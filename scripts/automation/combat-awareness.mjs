import { getSelectedActor, measureDistance, sendAbilityCard } from "../utils.mjs";

/**
 * Check Combat Awareness status.
 * - Obsidian Ocelot: Always active at Rank 5
 * - Cyberwolf: Active at Rank 3 only when within 20m of another Cyberwolf in its pack
 * @param {object} [context] - Chat card button context
 */
export async function onCombatAwareness(context = {}) {
  const actor = context.actorId
    ? game.actors.get(context.actorId)
    : getSelectedActor();

  if (!actor) {
    ui.notifications.warn("Select an Obsidian Ocelot or Cyberwolf token first.");
    return;
  }

  const name = actor.name.toLowerCase();
  const isOcelot = name.includes("ocelot");
  const isWolf = name.includes("wolf") || name.includes("cyberwolf");

  if (isOcelot) {
    await sendAbilityCard("ability-card.hbs", {
      actorName: actor.name,
      actorImg: actor.img,
      abilityName: "Combat Awareness (Rank 5)",
      description: "The Obsidian Ocelot can use the Combat Awareness Role Ability at Rank 5. This is always active.",
      result: game.i18n.localize("CPRED_BF.chat.combatAwarenessActive"),
      success: true,
    }, {
      speaker: ChatMessage.getSpeaker({ actor }),
    });
    return;
  }

  if (isWolf) {
    // Find the selected token on the canvas
    const selectedToken = canvas.tokens?.controlled?.[0];
    if (!selectedToken) {
      ui.notifications.warn("Select the Cyberwolf token on the canvas.");
      return;
    }

    // Find all other Cyberwolf tokens within 20m
    const allTokens = canvas.tokens?.placeables ?? [];
    const nearbyWolves = allTokens.filter((t) => {
      if (t.id === selectedToken.id) return false;
      const tName = (t.actor?.name ?? "").toLowerCase();
      if (!tName.includes("wolf") && !tName.includes("cyberwolf")) return false;
      const distance = measureDistance(selectedToken, t);
      return distance <= 20;
    });

    const active = nearbyWolves.length > 0;

    await sendAbilityCard("ability-card.hbs", {
      actorName: actor.name,
      actorImg: actor.img,
      abilityName: "Combat Awareness (Rank 3)",
      description: "The Cyberwolf can use Combat Awareness at Rank 3 while within 20 m/yds of another Cyberwolf in its pack.",
      result: active
        ? `${game.i18n.localize("CPRED_BF.chat.combatAwarenessActive")} ${nearbyWolves.length} allied Cyberwolf(s) within range.`
        : game.i18n.localize("CPRED_BF.chat.combatAwarenessInactive"),
      success: active,
    }, {
      speaker: ChatMessage.getSpeaker({ actor }),
    });
    return;
  }

  ui.notifications.warn("This ability is for Obsidian Ocelots and Cyberwolves only.");
}
