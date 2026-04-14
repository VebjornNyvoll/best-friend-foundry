import { getSelectedActor, getTargetedActor, cprSkillCheck, cprDamageRoll, applyHPDamage, formatRollDisplay, sendAbilityCard } from "../utils.mjs";

/**
 * Activate the Cyberrat's Venom Fangs/Claws ability.
 * On a successful hit (assumed — macro is triggered after a hit), the target
 * must beat DV13 Resist Torture/Drugs or take 1d6 HP damage directly.
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
    abilityName: "Venom Fangs/Claws",
    description: "The target must beat a DV13 Resist Torture/Drugs Check or take 1d6 damage directly to HP.",
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
 * Target rolls WILL + Resist Torture/Drugs vs DV13.
 */
export async function onVenomResistRoll(context = {}) {
  const target = context.targetId
    ? game.actors.get(context.targetId)
    : getTargetedActor();

  if (!target) {
    ui.notifications.warn("No target found for resist roll.");
    return;
  }

  // CPR Resist Torture/Drugs uses WILL stat
  const check = await cprSkillCheck(target, "will", "Resist Torture");
  const dv = 13;
  const success = check.total >= dv;
  const display = formatRollDisplay(check.roll, {
    statKey: check.statKey,
    statValue: check.statValue,
    skillName: check.skillName,
    skillLevel: check.skillLevel,
  });

  if (success) {
    await sendAbilityCard("ability-card.hbs", {
      actorName: target.name,
      actorImg: target.img,
      abilityName: "Resist Venom",
      rollTotal: check.total,
      rollBreakdown: display.breakdown,
      dieResult: display.dieResult,
      critRoll: display.critRoll,
      isCritSuccess: display.isCritSuccess,
      isCritFail: display.isCritFail,
      isCrit: display.isCrit,
      dv,
      success: true,
      result: `${target.name} resisted the venom!`,
    }, {
      speaker: ChatMessage.getSpeaker({ actor: target }),
      rolls: [...check._rolls],
    });
  } else {
    // Roll 1d6 damage directly to HP
    const damage = await cprDamageRoll("1d6");
    const { oldHP, newHP } = await applyHPDamage(target, damage.total);

    await sendAbilityCard("ability-card.hbs", {
      actorName: target.name,
      actorImg: target.img,
      abilityName: "Resist Venom",
      rollTotal: check.total,
      rollBreakdown: display.breakdown,
      dieResult: display.dieResult,
      critRoll: display.critRoll,
      isCritSuccess: display.isCritSuccess,
      isCritFail: display.isCritFail,
      isCrit: display.isCrit,
      dv,
      success: false,
      damageTotal: damage.total,
      damageFormula: damage.result,
      result: `Venom deals ${damage.total} damage directly to HP! (${oldHP} → ${newHP})`,
    }, {
      speaker: ChatMessage.getSpeaker({ actor: target }),
      rolls: [...check._rolls, ...damage._rolls],
    });
  }
}
