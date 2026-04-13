import { getSelectedActor, getFlag, setFlag, sendAbilityCard } from "../utils.mjs";

/**
 * Toggle the Forever Turtle's Protection ability.
 * When activated, Hardened Shell SP extends to head. Cannot be targeted by Aimed Shots.
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
    // Deactivate protection — restore original head SP
    await setFlag(actor, "protectionActive", false);

    const savedHeadSP = getFlag(actor, "protectionOriginalHeadSP");

    // Restore head armor SP to original value
    const armorItem = actor.items.find(
      (i) => i.type === "armor" && (
        i.name.toLowerCase().includes("subdermal") ||
        i.name.toLowerCase().includes("hardened shell")
      )
    );
    if (armorItem && savedHeadSP !== undefined) {
      await armorItem.update({ "system.headLocation.sp": savedHeadSP });
    }

    // Remove the protection Active Effect
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
    // Activate protection — extend body SP to head
    await setFlag(actor, "protectionActive", true);

    // Find the Hardened Shell / Subdermal Armor item
    const armorItem = actor.items.find(
      (i) => i.type === "armor" && (
        i.name.toLowerCase().includes("subdermal") ||
        i.name.toLowerCase().includes("hardened shell")
      )
    );

    let shellSP = 11; // fallback
    if (armorItem) {
      shellSP = armorItem.system.bodyLocation?.sp ?? 11;

      // Save current head SP so we can restore it on deactivation
      const currentHeadSP = armorItem.system.headLocation?.sp ?? 0;
      await setFlag(actor, "protectionOriginalHeadSP", currentHeadSP);

      // Set head SP to match body SP
      await armorItem.update({ "system.headLocation.sp": shellSP });
    }

    // Create an Active Effect to visually indicate protection is active
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
