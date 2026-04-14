import { getSelectedActor, getTargetedActor, cprSkillCheck, cprAttackRoll, cprDamageRoll, applyHPDamage, formatRollDisplay, sendAbilityCard } from "../utils.mjs";

/**
 * Cyberbear Martial Art: Recovery
 * When knocked prone, attempt DV13 Martial Arts to Get Up as a free action.
 */
export async function onRecovery(context = {}) {
  const actor = context.actorId
    ? game.actors.get(context.actorId)
    : getSelectedActor();

  if (!actor) {
    ui.notifications.warn("Select a Cyberbear token first.");
    return;
  }

  // DEX + Martial Arts (Cyberbear) vs DV13
  const check = await cprSkillCheck(actor, "dex", "Martial Arts");
  const dv = 13;
  const success = check.total >= dv;
  const display = formatRollDisplay(check.roll, {
    statKey: check.statKey,
    statValue: check.statValue,
    skillName: check.skillName,
    skillLevel: check.skillLevel,
  });

  await sendAbilityCard("ability-card.hbs", {
    actorName: actor.name,
    actorImg: actor.img,
    abilityName: "Recovery",
    description: "When the Cyberbear uses the Get Up Action, it can attempt to beat DV13 with Martial Arts. On success, the Get Up didn't cost an Action.",
    rollTotal: check.total,
    rollBreakdown: display.breakdown,
    dieResult: display.dieResult,
    critRoll: display.critRoll,
    isCritSuccess: display.isCritSuccess,
    isCritFail: display.isCritFail,
    isCrit: display.isCrit,
    dv,
    success,
    result: success
      ? "Success! The Cyberbear Gets Up as a free action (no Action cost)."
      : "Failed. The Get Up action costs an Action as normal.",
  }, {
    speaker: ChatMessage.getSpeaker({ actor }),
    rolls: [...check._rolls],
  });
}

/**
 * Cyberbear Martial Art: Three-Arm Strike
 * After hitting the same target with two Bear Claw attacks, attempt DV15.
 * On success: choose one of four effects. On failure: 5 self-damage from brain tumor.
 */
export async function onThreeArmStrike(context = {}) {
  const actor = context.actorId
    ? game.actors.get(context.actorId)
    : getSelectedActor();

  if (!actor) {
    ui.notifications.warn("Select a Cyberbear token first.");
    return;
  }

  // DEX + Martial Arts (Cyberbear) vs DV15
  const check = await cprSkillCheck(actor, "dex", "Martial Arts");
  const dv = 15;
  const success = check.total >= dv;
  const display = formatRollDisplay(check.roll, {
    statKey: check.statKey,
    statValue: check.statValue,
    skillName: check.skillName,
    skillLevel: check.skillLevel,
  });

  if (success) {
    // Show the four options via martial-art-card template
    await sendAbilityCard("martial-art-card.hbs", {
      actorName: actor.name,
      actorImg: actor.img,
      rollTotal: check.total,
      rollBreakdown: display.breakdown,
      dieResult: display.dieResult,
      isCritSuccess: display.isCritSuccess,
      isCritFail: display.isCritFail,
      isCrit: display.isCrit,
      critRoll: display.critRoll,
      dv,
      success: true,
      actorId: actor.id,
      targetId: context.targetId ?? "",
    }, {
      speaker: ChatMessage.getSpeaker({ actor }),
      rolls: [...check._rolls],
    });
  } else {
    // Failure: 5 damage directly to Cyberbear's HP from brain tumor
    const { oldHP, newHP } = await applyHPDamage(actor, 5);

    await sendAbilityCard("ability-card.hbs", {
      actorName: actor.name,
      actorImg: actor.img,
      abilityName: "Three-Arm Strike",
      rollTotal: check.total,
      rollBreakdown: display.breakdown,
      dieResult: display.dieResult,
      critRoll: display.critRoll,
      isCritSuccess: display.isCritSuccess,
      isCritFail: display.isCritFail,
      isCrit: display.isCrit,
      dv,
      success: false,
      selfDamage: 5,
      result: `Failed! The brain tumor causes ${actor.name} to suffer 5 damage directly to HP. (${oldHP} → ${newHP})`,
    }, {
      speaker: ChatMessage.getSpeaker({ actor }),
      rolls: [...check._rolls],
    });
  }
}

/**
 * Handle a Three-Arm Strike option selection.
 */
export async function onThreeArmStrikeOption(context = {}) {
  const actor = context.actorId
    ? game.actors.get(context.actorId)
    : getSelectedActor();
  const target = context.targetId
    ? game.actors.get(context.targetId)
    : getTargetedActor();

  if (!actor) return;

  const option = context.option;
  let resultText = "";
  let optionRolls = [];

  switch (option) {
    case "grapple":
      resultText = `${actor.name} grapples (or ends a grapple with) ${target?.name ?? "the target"}.`;
      break;

    case "extraAttack": {
      // Roll an additional Bear Claw or Combat Jaw attack
      const attack = await cprAttackRoll(16);
      const damage = await cprDamageRoll("3d6");
      const atkDisplay = formatRollDisplay(attack.roll);
      resultText = `${actor.name} attacks again! Attack: ${attack.total} (${atkDisplay.breakdown}), Damage: ${damage.total} (${damage.result})`;
      optionRolls = [...attack._rolls, ...damage._rolls];
      break;
    }

    case "criticalInjury": {
      const critRoll = await cprDamageRoll("2d6");
      resultText = `${target?.name ?? "Target"} suffers a random Body Critical Injury! Roll: ${critRoll.total} (${critRoll.result}). See CP:R page 187.`;
      optionRolls = [...critRoll._rolls];
      break;
    }

    case "reduceSP": {
      if (target) {
        for (const item of target.items) {
          if (item.type === "armor" && item.system?.isEquipped) {
            const updates = {};
            if (item.system.bodyLocation?.sp > 0) {
              updates["system.bodyLocation.sp"] = Math.max(0, item.system.bodyLocation.sp - 4);
            }
            if (item.system.headLocation?.sp > 0) {
              updates["system.headLocation.sp"] = Math.max(0, item.system.headLocation.sp - 4);
            }
            if (Object.keys(updates).length > 0) {
              await item.update(updates);
            }
          }
        }
      }
      resultText = `${target?.name ?? "Target"}'s worn armor SP reduced by 4!`;
      break;
    }

    default:
      resultText = "Unknown option.";
  }

  await ChatMessage.create({
    content: `<div class="cpred-bf-card">
      <div class="card-header">
        <img src="${actor.img}" />
        <h3>Three-Arm Strike</h3>
      </div>
      <div class="card-body">
        <p>${resultText}</p>
      </div>
    </div>`,
    rolls: optionRolls,
    speaker: ChatMessage.getSpeaker({ actor }),
  });
}
