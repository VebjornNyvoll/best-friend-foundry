import { getSelectedActor, getFlag, setFlag, sendAbilityCard } from "../utils.mjs";

/**
 * Toggle the Forever Turtle's Protection ability.
 * When activated, Hardened Shell SP extends to head. Cannot be targeted by Aimed Shots.
 * @param {object} [context] - Chat card button context
 */
export async function onProtection(context = {}) {
  const actor = context.actorId
    ? game.actors.get(context.actorId)
    : getSelectedActor();

  if (!actor) {
    ui.notifications.warn("Select a Forever Turtle token first.");
    return;
  }

  const isActive = getFlag(actor, "protectionActive") ?? false;

  if (isActive) {
    // Deactivate protection
    await setFlag(actor, "protectionActive", false);

    // Remove the protection Active Effect if it exists
    const effect = actor.effects.find((e) => e.name === "Protection (Shell)");
    if (effect) await effect.delete();

    await sendAbilityCard("protection-card.hbs", {
      actorName: actor.name,
      actorImg: actor.img,
      active: false,
      actorId: actor.id,
    }, {
      speaker: ChatMessage.getSpeaker({ actor }),
    });
  } else {
    // Activate protection
    await setFlag(actor, "protectionActive", true);

    // Find the Hardened Shell (Subdermal Armor) item to get its SP
    const shell = actor.items.find(
      (i) => i.name.toLowerCase().includes("hardened shell") ||
        (i.name.toLowerCase().includes("subdermal") && i.type === "cyberware")
    );
    const shellSP = shell?.system?.bodyLocation?.sp ?? 11;

    // Create an Active Effect to note protection is active
    await actor.createEmbeddedDocuments("ActiveEffect", [{
      name: "Protection (Shell)",
      icon: "icons/svg/shield.svg",
      origin: `Actor.${actor.id}`,
      disabled: false,
      description: `Hardened Shell extends to head (SP ${shellSP}). Cannot be targeted by Aimed Shots.`,
    }]);

    await sendAbilityCard("protection-card.hbs", {
      actorName: actor.name,
      actorImg: actor.img,
      active: true,
      shellSP,
      actorId: actor.id,
    }, {
      speaker: ChatMessage.getSpeaker({ actor }),
    });
  }
}
