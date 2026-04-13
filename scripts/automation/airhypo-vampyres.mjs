import { getSelectedActor, getFlag, setFlag, sendAbilityCard } from "../utils.mjs";

const MAX_DOSES = 5;

/**
 * Activate the Cyberboa's Airhypo Vampyres ability.
 * On a successful Vampyres hit, injects a dose of loaded substance. Max 5 doses.
 * @param {object} [context] - Chat card button context
 */
export async function onAirhypoVampyres(context = {}) {
  const actor = context.actorId
    ? game.actors.get(context.actorId)
    : getSelectedActor();

  if (!actor) {
    ui.notifications.warn("Select a Cyberboa token first.");
    return;
  }

  let doses = getFlag(actor, "airhypoDoses");
  if (doses === undefined || doses === null) {
    doses = MAX_DOSES;
    await setFlag(actor, "airhypoDoses", doses);
  }

  if (doses <= 0) {
    ui.notifications.warn(game.i18n.localize("CPRED_BF.chat.noDoses"));
    return;
  }

  // Decrement dose
  const remaining = doses - 1;
  await setFlag(actor, "airhypoDoses", remaining);

  await sendAbilityCard("ability-card.hbs", {
    actorName: actor.name,
    actorImg: actor.img,
    abilityName: game.i18n.localize("CPRED_BF.abilities.airhypoVampyres"),
    description: `Airhypo Vampyres inject a dose of the loaded substance into the target.`,
    result: `Dose injected! ${remaining}/${MAX_DOSES} doses remaining. GM: Apply the loaded Biotoxin, Poison, or Street Drug effect to the target.`,
    showReload: true,
    actorId: actor.id,
    doses: remaining,
    maxDoses: MAX_DOSES,
  }, {
    speaker: ChatMessage.getSpeaker({ actor }),
  });
}

/**
 * Reload the Airhypo Vampyres to full doses.
 * @param {object} context - Chat card button context
 */
export async function onAirhypoReload(context = {}) {
  const actor = context.actorId
    ? game.actors.get(context.actorId)
    : getSelectedActor();

  if (!actor) {
    ui.notifications.warn("Select a Cyberboa token first.");
    return;
  }

  await setFlag(actor, "airhypoDoses", MAX_DOSES);

  await ChatMessage.create({
    content: `<div class="cpred-bf-card">
      <div class="card-body">
        <p><strong>${actor.name}</strong> reloads Airhypo Vampyres to ${MAX_DOSES}/${MAX_DOSES} doses.</p>
      </div>
    </div>`,
    speaker: ChatMessage.getSpeaker({ actor }),
  });
}
