import { getSelectedActor, getTargetedActor, rollDVCheck, rollDamage, sendAbilityCard } from "../utils.mjs";

/**
 * Activate the Cyberrat's Venom Fangs/Claws ability.
 * On a successful hit, target must beat DV13 Resist Torture/Drugs or take 1d6 HP damage.
 * @param {object} [context] - Chat card button context
 */
export async function onVenomFangs(context = {}) {
  const actor = context.actorId
    ? game.actors.get(context.actorId)
    : getSelectedActor();

  if (!actor) {
    ui.notifications.warn("Select a Cyberrat token first.");
    return;
  }

  const target = context.targetId
    ? game.actors.get(context.targetId)
    : getTargetedActor();

  // Send the initial card with resist button
  await sendAbilityCard("venom-card.hbs", {
    actorName: actor.name,
    actorImg: actor.img,
    abilityName: game.i18n.localize("CPRED_BF.abilities.venomFangs"),
    description: game.i18n.localize("CPRED_BF.abilities.venomFangs.desc"),
    dv: 13,
    targetName: target?.name ?? "Target",
    targetId: target?.id ?? "",
    actorId: actor.id,
  }, {
    speaker: ChatMessage.getSpeaker({ actor }),
  });
}

/**
 * Handle the resist roll for Venom Fangs.
 * @param {object} context - Chat card button context
 */
export async function onVenomResistRoll(context = {}) {
  const target = context.targetId
    ? game.actors.get(context.targetId)
    : getTargetedActor();

  if (!target) {
    ui.notifications.warn("No target found for resist roll.");
    return;
  }

  // Get target's COOL + Resist Torture/Drugs
  const cool = target.system?.stats?.cool?.value ?? 0;
  const resistSkill = target.items.find(
    (i) => i.type === "skill" && i.name.toLowerCase().includes("resist torture")
  );
  const skillLevel = resistSkill?.system?.level ?? 0;

  const { roll, total, success } = await rollDVCheck(cool, skillLevel, 13);

  if (success) {
    await ChatMessage.create({
      content: `<div class="cpred-bf-card">
        <div class="card-body">
          <div class="roll-result success">
            ${target.name} resisted! Rolled ${total} (${roll.result}) vs DV13
          </div>
        </div>
      </div>`,
      speaker: ChatMessage.getSpeaker({ actor: target }),
    });
  } else {
    // Roll 1d6 damage directly to HP
    const { roll: dmgRoll, total: dmgTotal } = await rollDamage("1d6");
    const currentHP = target.system?.derivedStats?.hp?.value ?? 0;
    await target.update({
      "system.derivedStats.hp.value": Math.max(0, currentHP - dmgTotal),
    });

    await ChatMessage.create({
      content: `<div class="cpred-bf-card">
        <div class="card-body">
          <div class="roll-result failure">
            ${target.name} failed! Rolled ${total} (${roll.result}) vs DV13
          </div>
          <p>Venom deals <strong>${dmgTotal}</strong> (${dmgRoll.result}) damage directly to HP!</p>
        </div>
      </div>`,
      speaker: ChatMessage.getSpeaker({ actor: target }),
    });
  }
}
